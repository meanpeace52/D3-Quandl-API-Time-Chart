'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    async = require('async'),
    _ = require('lodash'),
    moment = require('moment'),
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
        title: new RegExp(req.query.q, 'i'),
        access: { $ne : 'private' }
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
                .exec(function (err, results) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        _.each(results, function(model){
                            if (model.access === 'for sale' && model.buyers && model.buyers.length > 0){
                                var purchased = _.find(model.buyers, function(buyer){
                                    return buyer.id.toString() === req.user._id.id;
                                });
                                if (purchased){
                                    model.purchased = true;
                                }
                            }
                            delete model.buyers;
                        });
                        callback(null, results);
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
            user: req.params.id
        })
        .populate('user', 'username')
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
    Model.findOne({ title : req.body.title, user : req.user._id }, function(err, foundmodel){
        if (err){
            return res.status(err.status).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        if (!foundmodel){
            req.body.user = req.user._id;
            if (!req.user.plan || (req.user.plan && req.user.plan === 'free')){
                req.body.access = 'public';
                delete req.body.cost;
                delete req.body.previewnote;
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
        }
        else{
            res.status(409).json('Model with this title already exists, please enter a different title.');
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
        .populate('user', 'username')
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
    Model.findOne({ title : req.body.title, user : req.user._id }, function(err, foundmodel) {
        if (err) {
            return res.status(err.status).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        if (!foundmodel || (foundmodel && foundmodel.id === req.body._id)) {
            if (!req.user.plan || (req.user.plan && req.user.plan === 'free')) {
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
        }
        else {
            res.status(409).json('Model with this title already exists, please enter a different title.');
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

exports.purchaseModel = function (req, res) {
    var user = req.user._id;

    Model.findOneAndUpdate({ _id : req.params.id }, { $push : { buyers : user }}, function(err, doc){
        if (err){
            console.log(err);
            res.status(err.status).json(err);
        }
        else{
            //return DatasetS3Service.copyDatasetFile(user.username, doc.s3reference)
            //    .then(function(path){
                    var model = new Model(_.omit(doc.toObject(), '_id'));
                    model.user = user;
                    model.users = [ model.user ];
                    model.created = new Date();
                    model.origModel = doc._id;
                    //dataset.s3reference = 'https://s3.amazonaws.com/datasetstl/' + path;
                    model.title = doc.title + ' - ' + moment().format('MM/DD/YYYY, h:mm:ss a');
                    model.access = 'purchased';
                    model.save(function(err, doc){
                        if (err){

                        }
                    });
                    res.json({ success : true });
            //    })
            //    .catch(function(err){
            //        res.status(err.status).json(err);
            //    });
        }
    });
};
