'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    async = require('async'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Model = mongoose.model('Model');

/**
 * List models
 */
exports.list = function (req, res) {
    Model.find({})
        .sort('-created')
        .populate('user', 'username')
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

exports.searchModel = function (req, res) {
    var query = {
        title: new RegExp(req.query.q, 'i')
    };
    var count = 0;

    async.parallel({
        count : function(callback){
            Model.count(query)
                .exec(function(err, count){
                    if (err){
                        callback(err);
                    }
                    else{
                        callback(null, count);
                    }
                });
        },
        models : function(callback){
            Model.find(query)
                .sort('-created')
                .skip(req.query.itemsPerPage * (req.query.currentPage - 1))
                .limit(req.query.itemsPerPage)
                .populate('user', 'username')
                .lean()
                .exec(function (err, datasets) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, datasets);
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
            res.jsonp({ count : results.count, models : results.models });
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

    if (!req.user.plan || (req.user.plan && req.user.plan === 'free')){
        req.body.access = 'public';
        delete req.body.model.cost;
        delete req.body.model.previewnote;
    }

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
    if (!req.user.plan || (req.user.plan && req.user.plan === 'free')){
        req.body.model.access = 'public';
        delete req.body.model.cost;
        delete req.body.model.previewnote;
    }

    Model.update({
        _id: req.params.modelId
    }, req.body, function (err, _res) {
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
