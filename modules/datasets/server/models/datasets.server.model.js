'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Post Schema
 */
var DatasetSchema = new Schema({
    title: {
        type: String,
        default: '',
        required: 'Please give this Dataset a title',
        index: { unique: true },
        trim: true
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
    origDataset: {
        type: Schema.ObjectId,
        ref: 'Dataset'
    },
    source: {
        type: String,
        default: ''
    },
    seas: {
        type: String,
        default: ''
    },
    filename: {
        type: String,
        default: ''
    },
    s3reference: {
        type: String,
        default: ''
    },
    access: {
        type: String,
        enum: ['public', 'paid', 'private'],
        default: ['private']
    },
    mediatype: {
        type: [{
            type: String,
            enum: ['in the news', 'trending on TheoryLab'] // 5 tags, listed above, “in the news,” “trending on TheoryLab,” etc
        }],
        default: ['in the news']
    },
    subject: {
        type: String,
        default: 'Tags' // Tags
    }
});

mongoose.model('Dataset', DatasetSchema);
