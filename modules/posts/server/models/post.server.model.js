'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Post Schema
 */
var PostSchema = new Schema({
	title: {
        type: String,
        default: ''
    },
    created: {
        type: Date,
        default: Date.now
    },
	user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    subject: {
        type: [{
            type: String,
            enum: ['finance', 'sosh sci', 'sports']
        }],
        default: ['finance']
    },
    access: {
        type: Number,
        default: 0 // 0, 1, 2 (public/private/for sale)
    },
    dataset: {
        type: Schema.ObjectId,
        ref: 'Dataset' // if there is a dataset referred to by the post, if so, this should ref to actual dataset (by dataset title)
    },
    model: {
        type: String,
        default: ''
    },
    s3reference: {
        type: String,
        default: ''
    },
    source: {
        type: String,
        default: ''
    },
    post: {
        type: String,
        default: ''
    },
    mediatype: {
        type: [{
            type: String,
            enum: ['in the news', 'trending on TheoryLab'] // 5 tags, listed above, “in the news,” “trending on TheoryLab,” etc
        }],
        default: ['in the news']
    }
});

mongoose.model('Post', PostSchema);
