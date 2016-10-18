'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


 /**
  * StripeEvent Schema
  */
 var StripeEventSchema = new Schema({
   _id: String,
   data: Schema.Types.Mixed
 });


 mongoose.model('StripeEvent', StripeEventSchema);
