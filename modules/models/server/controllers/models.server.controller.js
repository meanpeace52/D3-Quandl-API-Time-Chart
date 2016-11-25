'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    async = require('async'),
    _ = require('lodash'),
    moment = require('moment'),
    modelsService = require('../services/models.server.s3.js'),
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

function saveModelCopy(user, entry, cb) {
    if (entry.user && user._id === entry.user._id){
        throw new Error('You can not copy your own model.');
    }

    modelsService.copyModelFile(user.username, entry.s3reference)
        .then(function(path){
            var model = new Model(_.omit(entry, '_id'));
            model.user = user;
            model.users = [ entry.user ];
            model.created = new Date();
            model.origModel = entry._id;
            model.title = model.title + ' - ' + moment().format('MM/DD/YYYY, h:mm:ss a');
            model.s3reference = 'https://s3.amazonaws.com/' + path;
            model.save(cb);
        })
        .catch(function(err){
            throw new Error(err);
        });
}

exports.copymodel = function (req, res) {
    Model.findById(req.body._id)
        .lean()
        .exec(function (err, model) {
            if (err) {
                console.log('error retreiving the entry', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            saveModelCopy(req.user, model, function (err, result) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                else {
                    res.json(result);
                }
            });
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
                .populate('dataset')
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
        .populate('dataset')
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
            if (req.body.modelkey){
                req.body.s3reference = 'https://s3.amazonaws.com/rdatamodels' + req.body.modelkey;
            }
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
        .populate('dataset')
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

exports.getModelByDataset = function(req, res){
    Model.findOne({ dataset : req.params.id })
        .lean()
        .exec(function(err, model){
            if (err){
                res.status(err.status).send(err);
            }
            else{
                res.json(model);
            }
        });
};


exports.purchaseModel = function (id, user, next) {
    Model.findOneAndUpdate({ _id : id }, { $push : { buyers : user }}, function(err, doc){
        if (err){
            console.log(err);
            next(err);
        }
        else{
            //return modelsService.copyModelFile(user.username, doc.s3reference)
            //    .then(function(path){
                    var model = new Model(_.omit(doc.toObject(), '_id'));
                    model.user = user;
                    model.users = [ model.user ];
                    model.created = new Date();
                    model.origModel = doc._id;
                    //model.s3reference = 'https://s3.amazonaws.com/rdatamodels/' + path;
                    model.title = doc.title + ' - ' + moment().format('MM/DD/YYYY, h:mm:ss a');
                    model.access = 'purchased';
                    model.save(function(err, doc){
                        if (err){
                            console.log(err);
                            return next(err);
                        }
                    });
                    next(err,doc);
            //    })
            //    .catch(function(err){
            //        next(err);
            //    });
        }
    });
};
