'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Model = mongoose.model('Model'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Model
 */
exports.create = function(req, res) {
  var model = new Model(req.body);
  model.user = req.user;

  model.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(model);
    }
  });
};

/**
 * Show the current Model
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var model = req.model ? req.model.toJSON() : {};

  // Add a custom field to the Post, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Post model.
  model.isCurrentUserOwner = req.user && model.user && model.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(model);
};

/**
 * Update a Model
 */
exports.update = function(req, res) {
  var model = req.model ;

  model = _.extend(model , req.body);

  model.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(model);
    }
  });
};

/**
 * Delete an Model
 */
exports.delete = function(req, res) {
  var model = req.model ;

  model.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(model);
    }
  });
};

/**
 * List of Models
 */
exports.list = function(req, res) { 
  Model.find().sort('-created').populate('user', 'displayName').exec(function(err, models) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(models);
    }
  });
};

/**
 * Model middleware
 */
exports.modelByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Model is invalid'
    });
  }

  Model.findById(id).populate('user', 'displayName').exec(function (err, model) {
    if (err) {
      return next(err);
    } else if (!model) {
      return res.status(404).send({
        message: 'No Model with that identifier has been found'
      });
    }
    req.model = model;
    next();
  });
};
