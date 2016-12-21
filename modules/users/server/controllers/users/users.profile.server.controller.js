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
    async = require('async'),
    config = require(path.resolve('./config/config')),
    User = mongoose.model('User'),
    s3 = require('s3'),
    email = require(path.resolve('./modules/core/server/services/emails.server.service')),
    client = s3.createClient({
        maxAsyncS3: 20, // this is the default
        s3RetryCount: 3, // this is the default
        s3RetryDelay: 1000, // this is the default
        multipartUploadThreshold: 20971520, // this is the default (20 MB)
        multipartUploadSize: 15728640, // this is the default (15 MB)
        s3Options: {
            accessKeyId: config.s3AccessKeyId,
            secretAccessKey: config.s3SecretAccessKey
                // any other options are passed to new AWS.S3()
                // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
        }
    });


/**
 * Update user details
 */
exports.update = function (req, res) {
    // Init Variables
    var user = req.user,
        verifyemail = false;

    User.findOne({ email : req.body.email }, function(err, doc){
        if (err){
            return res.status(400).send({
                message: 'Error looking up email address.'
            });
        }

        if (user) {
            if (doc && doc.id !== user._id.toString()){
                return res.status(400).send({
                    message: 'This email address has already been registered with another user.'
                });
            }

            if(user.email !== req.body.email){
                verifyemail = true;
                user.emailIsVerified = false;
            }

            // For security measure we remove the roles from the req.body object
            delete req.body.emailIsVerified;
            delete req.body.roles;
            // Merge existing user
            //user = _.extend(user, req.body);
            user.username = req.body.username;
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.email = req.body.email;
            user.hideEmailInProfile = req.body.hideEmailInProfile;


            user.updated = Date.now();
            user.displayName = user.firstName + ' ' + user.lastName;
            user.save(function (err) {
                if (err) return res.status(400).send({message: errorHandler.getErrorMessage(err)});
                if(verifyemail){
                    email.verifyEmail(req, user, function(err){
                        res.json(user.profile());
                    });
                }else{
                    res.json(user.profile());
                }
            });
        }
        else {
            res.status(400).send({
                message: 'User is not signed in'
            });
        }
    });



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
    res.json(req.user ? req.user.profile() : null);
};

exports.read = function (req, res) {
    console.log(req.readUser);
    res.json(req.readUser || null);
};

exports.search = function (req, res) {
    var query = {
        username: new RegExp(req.query.q, 'i')
    };

    async.parallel({
        users : function(callback){
            User.find(query)
                .sort('-created')
                .select({
                    'username': 1,
                    '_id': 1
                })
                .skip(req.query.itemsPerPage * (req.query.currentPage - 1))
                .limit(req.query.itemsPerPage)
                .lean()
                .exec(function (err, users) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, users);
                    }
                });
        },
        count : function(callback){
            User.count(query)
                .exec(function(err, count){
                    if (err){
                        callback(err);
                    }
                    else{
                        callback(null, count);
                    }
                });
        }

    }, function(err, results){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.jsonp({ users : results.users, count : results.count });
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
            Key: req.user.username + '/' + req.file.filename + '.pdf'
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
            _id: req.user.username + '/' + req.file.filename + '.pdf'
        };
        req.user.files.push(fileData);
        req.user.save(function (saveError, user) {
            if (saveError) {
                return res.status(500).send({
                    message: errorHandler.getErrorMessage(saveError)
                });
            }
            else {
                res.json({ file : fileData });
                fs.unlink(req.file.path);
            }
        });
    });
};


exports.getFile = function (req, res) {

    var localBucketFile = './s3-cache/files/' + req.query.file;
    try{
        fs.accessSync(localBucketFile);
        fs.readFile(path.resolve('s3-cache/files') + '/' + req.query.file, function (err,data){
            res.contentType('application/pdf');
            res.send(data);
        });
    }
    catch(e){
        var params = {
            localFile: localBucketFile,

            s3Params: {
                Bucket: 'theorylab-pdfs',
                Key: req.query.file
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
            fs.readFile(path.resolve('s3-cache/files') + '/' + req.query.file , function (err,data){
                res.contentType('application/pdf');
                res.send(data);
            });
        });
    }
};

// trims sensitive paid model data if user hasn't paid for it
exports.trimIfPaid = function (user, models) {
    _.each(models, function(model){
        if (model.access === 'for sale' || model.access === 'paid'){
            if (model.buyers){
                var purchased = _.find(model.buyers, function(buyer){
                    return buyer.id === user.id;
                });
                if (purchased){
                    model.purchased = true;
                }
            }

            if (!model.purchased) {
                model.content = undefined;
            }
        }
        delete model.buyers;
    });
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
    })
    .populate('user', 'username email hideEmailInProfile')
    .sort('-created')
    .lean()
    .exec(function (err, models) {
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

exports.sendUserProfileEmail = function (req, res) {
    User.findOne({ username: req.body.username })
        .lean()
        .exec(function (err, user) {
        if (err) return res.status(err.status).send(err);
        if (!user) return res.status(404).send({ message : 'Failed to load User ' + req.body.username });

        email.sendToProfileUser({
            username : user.username,
            email : user.email
        }, {
            username: req.user.username,
            email: req.user.email
        }, req.body.subject, req.body.message, function(){
            res.json({ success : true });
        });

    });
};
