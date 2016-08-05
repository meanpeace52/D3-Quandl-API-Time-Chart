'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    mongoose = require('mongoose'),
    multer = require('multer'),
    config = require(path.resolve('./config/config')),
    User = mongoose.model('User'),
    s3 = require('s3'),
    client = s3.createClient({
        maxAsyncS3: 20, // this is the default
        s3RetryCount: 3, // this is the default
        s3RetryDelay: 1000, // this is the default
        multipartUploadThreshold: 20971520, // this is the default (20 MB)
        multipartUploadSize: 15728640, // this is the default (15 MB)
        s3Options: {
            accessKeyId: 'AKIAI356G25CALROLSGA',
            secretAccessKey: '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'
                // any other options are passed to new AWS.S3()
                // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
        }
    });


/**
 * Update user details
 */
exports.update = function (req, res) {
    // Init Variables
    var user = req.user;

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    if (user) {
        // Merge existing user
        user = _.extend(user, req.body);
        user.updated = Date.now();
        user.displayName = user.firstName + ' ' + user.lastName;

        user.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                req.login(user, function (err) {
                    if (err) {
                        res.status(400).send(err);
                    }
                    else {
                        res.json(user);
                    }
                });
            }
        });
    }
    else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
    var user = req.user;
    var message = null;
    var upload = multer(config.uploads.profileUpload).single('newProfilePicture');
    var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;

    // Filtering to upload only images
    upload.fileFilter = profileUploadFileFilter;

    if (user) {
        upload(req, res, function (uploadError) {
            if (uploadError) {
                return res.status(400).send({
                    message: 'Error occurred while uploading profile picture'
                });
            }
            else {
                user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

                user.save(function (saveError) {
                    if (saveError) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(saveError)
                        });
                    }
                    else {
                        req.login(user, function (err) {
                            if (err) {
                                res.status(400).send(err);
                            }
                            else {
                                res.json(user);
                            }
                        });
                    }
                });
            }
        });
    }
    else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};



/**
 * Send User
 */
exports.me = function (req, res) {
    res.json(req.user || null);
};

exports.read = function (req, res) {
    console.log(req.readUser);
    res.json(req.readUser || null);
};

exports.search = function (req, res) {
    var query = {
        username: new RegExp(req.query.q, 'i')
    };
    User.find(query).sort('-created').select({
        'username': 1,
        '_id': 1
    }).limit(10).exec(function (err, users) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.jsonp(users);
        }
    });
};


/*
 * user middleware - SO
 * */
exports.userByUsername = function (req, res, next, username) {
    User.findOne({
        username: username
    }).exec(function (err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + username));
        req.readUser = user;
        next();
    });
};

exports.uploadFile = function (req, res) {
    var uploader = client.uploadFile({
        localFile: req.file.path,
        s3Params: {
            ContentType: req.file.mimetype,
            Bucket: 'theorylab-pdfs',
            Key: req.file.filename
        }
    });

    uploader.on('error', function (err) {
        res.status(500).send({
            message: errorHandler.getErrorMessage(err)
        });
        fs.unlink(req.file.path);
    });

    uploader.on('end', function (file) {
        var fileData = {
            name: req.file.originalname,
            _id: req.file.filename
        };
        req.user.files.push(fileData);
        req.user.save(function (saveError, user) {
            if (saveError) {
                return res.status(500).send({
                    message: errorHandler.getErrorMessage(saveError)
                });
            }
            else {
                res.json();
                fs.unlink(req.file.path);
            }
        });
    });
};


exports.getFile = function (req, res) {

    var params = {
        localFile: req.params.file,

        s3Params: {
            Bucket: 'pdfs',
            Key: req.params.file
                // other options supported by getObject
                // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
        }
    };

    var downloader = client.downloadFile(params);
    downloader.on('error', function (err) { // error to client
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
    downloader.on('progress', function () {});
    downloader.on('end', function (file) {
        res.send(file);
    });
};

// trims sensitive paid model data if user hasn't paid for it
exports.trimIfPaid = function (user, models) {
    for (var i = 0, len = models.length; i < len; i++) {
        var model = models[i];

        if (models.access === 'paid') {
            if (!user || user._id !== model.user || models.users.indexOf(user._id) === -1) {
                model.content = undefined;
            }
        }
    }
    return models;
};

exports.models = function (req, res) {
    // get posts, datasets or models for a user

    var model;

    if (req.params.model === 'datasets') {
        model = mongoose.model('Dataset');
    }
    else if (req.params.model === 'posts') {
        model = mongoose.model('Post');
    }
    else if (req.params.model === 'models') {
        model = mongoose.model('Model');
    }
    else {
        return res.status(400).send({
            message: errorHandler.getErrorMessage('Invalid model')
        });
    }

    model.find({
        user: req.readUser._id
    }).populate('user', 'displayName').sort('-created').exec(function (err, models) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            models = exports.trimIfPaid(req.user, models);
            res.json(models);
        }
    });
};
