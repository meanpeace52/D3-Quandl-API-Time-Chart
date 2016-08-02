'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Post = mongoose.model('post'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a post
 */

exports.create = function (req, res) {
    var post = new Post(req.body);
    post.user = req.user._id;
    if (req.body.files) {

    }
    post.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.json(post);
        }
    });
};

/**
 * Show the current post
 */
exports.read = function (req, res) {
    Post.findOne({
            _id: req.params.postId
        })
        .populate('user', 'displayName')
        .exec(function (err, post) {
            if (err) {
                res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            post = trimPostIfPaid(req.user, post);
            res.json(post);
        });
};

/**
 * List of posts
 */

exports.list = function (req, res) {

    var options;

    if (req.params.field) {
        options = {};
        options[req.params.field] = req.params.value;
    }

    Post.find(options).sort('-created').populate('user', 'displayName').exec(function (err, posts) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            posts.forEach(function (post, index, array) {
                trimPostIfPaid(req.user, post);
                if (index === array.length - 1) {
                    res.json(posts);
                }
            });
        }
    });
};


// trims sensitive paid Post data if user hasn't paid for it
function trimPostIfPaid(user, post) {
    if (post.access === 'paid') {
        if (!user || user._id !== post.user || post.users.indexOf(user._id) === -1) {
            post.content = undefined;
        }
    }
    return post;
}

/**
 * Update a post
 */
exports.update = function (req, res) {
    var post = req.post;

    post.title = req.body.title;
    post.content = req.body.content;

    post.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.json(post);
        }
    });
};

/**
 * Delete an post
 */
exports.delete = function (req, res) {
    var post = req.post;

    post.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.json(post);
        }
    });
};

/**
 * post middleware
 */
exports.postByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'post is invalid'
        });
    }

    Post.findById(id).populate('user', 'displayName').exec(function (err, post) {
        if (err) {
            return next(err);
        }
        else if (!post) {
            return res.status(404).send({
                message: 'No post with that identifier has been found'
            });
        }
        req.post = post;
        next();
    });
};