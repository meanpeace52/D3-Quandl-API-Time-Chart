'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Model = mongoose.model('Model');

/**
 * List models
 */
exports.list = function (req, res) {
    Model.find({})
        .sort('-created')
        .populate('user', 'displayName')
        .exec(function (err, models) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                res.json(models);
            }
        });
};

/**
 * List by user id
 */
exports.listByUserId = function (req, res) {
    Model.find({
            user: req.params.userId
        }).populate('user')
        .limit(100)
        .sort('-created')
        .exec(function (err, models) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                res.json(models);
            }
        });
};

/**
 * Create a model
 */
exports.create = function (req, res) {
    var modelFields = req.body;
    modelFields.user = req.user._id;
    var model = new Model(req.body);
    model.save(function (err, model) {
        if (err) {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.json(model);
        }
    });
};

/**
 * Get model by id
 */
exports.read = function (req, res) {
    Model.findOne({
            _id: req.params.modelId
        })
        .populate('user', 'displayName')
        .exec(function (err, model) {
            if (err) {
                res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                res.json(model);
            }
        });
};

/**
 * Update a model by id
 */
exports.update = function (req, res) {
    Model.update({
        _id: req.params.modelId
    }, req.body.model, function (err, _res) {
        if (err) {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.json(req.body.model);
        }
    });
};

/**
 * Delete a model by id
 */
exports.delete = function (req, res) {
    Model.remove({
        _id: req.params.modelId
    }, function (err, model) {
        if (err) {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.json(model);
        }
    });
};
