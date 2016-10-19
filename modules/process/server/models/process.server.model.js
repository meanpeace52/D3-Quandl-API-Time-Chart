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
        default: '',
        required: 'Please give this Process a title',
        trim: true
    },
    tasks: [{
        title: String,
        slug: String,
    }],
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
    access: {
        type: [{
            type: String,
            enum: ['private']
        }],
        default: ['private']
    }
});

mongoose.model('Process', ProcessSchema);
