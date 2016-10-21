'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Process = mongoose.model('Process');

/**
 * List processes
 */
exports.list = function (req, res) {
    Process.find({})
        .sort('-created')
        .populate('user', 'displayName')
        .exec(function (err, datasets) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                res.json(datasets);
            }
        });
};

/**
 * List by user id
 */
exports.listByUserId = function (req, res) {
    Process.find({
            user: req.params.userId,
            dataset: req.query.dataset
        })
        .limit(100)
        .sort('-created')
        .exec(function (err, processes) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                res.json(processes);
            }
        });
};

/**
 * Create a process
 */
exports.create = function (req, res) {
    new Process(req.body.process)
        .save(function (err, process) {
            if (err) {
                res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                res.json(process);
            }
        });
};

/**
 * Get process by id
 */
exports.read = function (req, res) {
    Process.findOne({
            _id: req.params.processId
        })
        .populate('user', 'displayName')
        .exec(function (err, process) {
            if (err) {
                res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                res.json(process);
            }
        });
};

/**
 * Update a process by id
 */
exports.update = function (req, res) {
    Process.update({
        _id: req.params.processId
    }, req.body.process, function (err, _res) {
        if (err) {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.json(req.body.process);
        }
    });
};

/**
 * Delete a process by id
 */
exports.delete = function (req, res) {
    Process.remove({
        _id: req.params.processId
    }, function (err, process) {
        if (err) {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.json(process);
        }
    });
};
