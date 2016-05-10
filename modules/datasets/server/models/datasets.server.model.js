'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Article Schema
 */
var DatasetSchema = new Schema({
    title: {
        type: String,
        default: '',
        required: 'Please give this Dataset a title',
        index: { unique: true },
        trim: true
    },
    index: {
        type: String,
        default: ''
    },
    notice: {
        type: String,
        default: ''
    },
    
    created: {
        type: Date,
        default: Date.now
    },
    frequency: {
        type: String,
        default: ''     
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    source: {
        type: String,
        default: ''
    },
    seas: {
        type: String,
        default: ''
    },
    s3reference: {
        type: String,
        default: ''
    },
});

mongoose.model('Dataset', DatasetSchema);
