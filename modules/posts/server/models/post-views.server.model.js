'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * post Schema
 */
var postViewSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    post: {
        type: Schema.ObjectId,
        ref: 'Post'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('PostView', postViewSchema);
