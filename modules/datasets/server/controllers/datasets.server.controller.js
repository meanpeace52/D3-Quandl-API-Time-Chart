'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    DatasetS3Service = require('../services/datasets.server.s3'),
    Dataset = mongoose.model('Dataset'),
    _ = require('lodash');


/**
 * List by username
 */
exports.listByUsername = function (req, res) {
    Dataset.find({ user: req.readUser._id }).limit(5).sort('-created').exec(function (err, datasets) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(datasets);
        }
    });
};

/**
 * Search Dataset by the query.
 *
 * @param req
 * @param res
 */
exports.searchDataset = function (req, res) {
    var query = { title: new RegExp(req.query.q, 'i') };
    Dataset.find(query).sort('-created').limit(10).populate('user', 'displayName').exec(function (err, datasets) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(datasets);
        }
    });
};

/**
 * Create a dataset
 */

function saveDatasetCopy(user, entry, cb) {
    var dataset = new Dataset(_.omit(entry.toObject(), '_id'));
    dataset.user = user;
    console.log('inside save', dataset);
    dataset.save(cb);
}

exports.create = function (req, res) {
    Dataset.findById(req.body._id).exec(function(err, entry) {
        if (err) {
            console.log('error retreiving the entry', err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        saveDatasetCopy(req.user, entry, function(err, result) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(result);
            }
        }); 
    });
};

/**
 * Show the current dataset
 */
exports.read = function (req, res) {
    res.json(req.dataset);
};

/**
 * Update a dataset
 */
exports.update = function (req, res) {
    var dataset = req.dataset;

    dataset.title = req.body.title;
    dataset.content = req.body.content;

    Dataset.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(dataset);
        }
    });
};

/**
 * Delete an dataset
 */
exports.delete = function (req, res) {
    var dataset = req.dataset;

    Dataset.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(dataset);
        }
    });
};

/**
 * List of datasets
 */
exports.list = function (req, res) {
    Dataset.find().sort('-created').populate('user', 'displayName').exec(function (err, datasets) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(datasets);
        }
    });
};

exports.readWithS3 = function (req, res) {
    var dataset = req.dataset;

    DatasetS3Service.readWithS3(dataset.s3reference).then(function (data) {
        res.json(data);
    }).catch(function (err) {
        res.status(400).json({ error: 'error reading file' });
    });
};

exports.datasetByID = function (req, res, next, id) {
    Dataset.findById(id).populate('user', 'displayName').exec(function (err, dataset) {
        if (err) {
            return next(err);
        }
        if (!dataset) {
            return next(new Error('Failed to load Dataset ' + id));
        }
        req.dataset = dataset;
        next();
    });
};
