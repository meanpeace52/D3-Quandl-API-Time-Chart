'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Model Schema
 */
var ModelSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Model name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Model', ModelSchema);
