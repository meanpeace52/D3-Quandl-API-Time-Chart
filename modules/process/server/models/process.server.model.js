'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Process Schema
 */
var ProcessSchema = new Schema({
    title: {
        type: String,
        required: 'Please give this Process a title'
    },
    tasks: [],
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    dataset: {
        type: Schema.ObjectId,
        ref: 'Dataset'
    },
    model: {
        type: Schema.ObjectId,
        ref: 'Model'
    },
    type: {
        type: String,
        required: 'Please give this Process a type'
    }
});

mongoose.model('Process', ProcessSchema);
