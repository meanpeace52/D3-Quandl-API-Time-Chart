'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * post Schema
 */
var postSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    subject: {
        type: String,
        default: '',
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    access: {
        type: String,
        default: 'public', // public | private
        trim: true
    },
    cost: {
      type: Number,
      default: 0,
      trim: false
    },
    attachments: {
        type: Array,
        default: [],
        trim: false
    }
});

mongoose.model('post', postSchema);
