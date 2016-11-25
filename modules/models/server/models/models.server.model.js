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
    equation: String,
    metrics: [],
    output: String,
    model: Object,
    origModel: {
        type: Schema.ObjectId,
        ref: 'Model'
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    users: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    created: {
        type: Date,
        default: Date.now
    },
    s3reference: String,
    access: {
        type: String,
        enum: ['public', 'for sale', 'private', 'purchased'],
        default: 'public'
    },
    cost: {
        type: Number
    },
    buyers: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    previewnote: String
});

mongoose.model('Model', ModelSchema);
