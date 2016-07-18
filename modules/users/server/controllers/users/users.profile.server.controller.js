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
    User = mongoose.model('User');

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
            } else {
                req.login(user, function (err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.json(user);
                    }
                });
            }
        });
    } else {
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
            if(uploadError) {
                return res.status(400).send({
                    message: 'Error occurred while uploading profile picture'
                });
            } else {
                user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

                user.save(function (saveError) {
                    if (saveError) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(saveError)
                        });
                    } else {
                        req.login(user, function (err) {
                            if (err) {
                                res.status(400).send(err);
                            } else {
                                res.json(user);
                            }
                        });
                    }
                });
            }
        });
    } else {
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

exports.read = function(req, res) {
    console.log(req.readUser);
    res.json(req.readUser || null);
};


exports.search = function(req, res) { 
  var query = {username: new RegExp(req.query.q, 'i')};
  User.find(query).sort('-created').select({'username':1,'_id':1}).limit(10).exec(function(err, users) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(users);
        }
    });
};



/*
* user middleware - SO
* */
exports.userByUsername = function(req, res, next, username) {
User.findOne({
    username: username
}).exec(function(err, user) {
    if (err) return next(err);
    if (!user) return next(new Error('Failed to load User ' + username));
    req.readUser = user;
    next();
});
};