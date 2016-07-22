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
    title: {
        type: String,
        required: 'Please fill Model title'
    },
    type: String,
    dataset: {
      type: Schema.ObjectId,
      ref: 'Dataset'
    },
    y: String,
    train: {
      type: Number,
      default: 0.7
    },
    model: Object,
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    access: {
        type: String,
        enum: ['public', 'paid', 'private'],
        default: 'public'
    }
});

mongoose.model('Model', ModelSchema);
