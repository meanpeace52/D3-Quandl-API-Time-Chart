'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Process = mongoose.model('Process'),
    _ = require('lodash');


/**
 * List processes
 */
exports.list = function(req, res) {

};

/**
 * List by username
 */
exports.listByUsername = function (req, res) {
    
};

/**
 * Create a process
 */
exports.create = function(req, res) {

};

/**
 * Get process by id
 */
exports.read = function(req, res) {

};

/**
 * Update a process by id
 */
exports.update = function(req, res) {

};

/**
 * Delete a process by id
 */
exports.delete = function(req, res) {

};
