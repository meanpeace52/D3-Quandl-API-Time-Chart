'use strict';

/**
 * Module dependencies.
 */

var path = require('path'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    User = mongoose.model('User'),
    StripeEvent = mongoose.model('StripeEvent'),
    path = require('path'),
    config = require(path.resolve('./config/config')),
    stripe = require('stripe')(config.stripe.secret_key),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    email = require(path.resolve('./modules/core/server/controllers/emails.server.controller'));



    /**
     * stripe webhook listener
     */

    exports.onStripeWebhookEvent = function (req, res) {
      if(!req.body || req.body.object !== 'event' || !req.body.id) {
        return res.status('400').send('Event data not included');
      }
      if (req.body.id === 'evt_00000000000000'){
        return res.status(200).end();
      }
      stripe.events.retrieve(req.body.id, function(err, event) {
        StripeEvent.findById(event.id, function(err,stripeEvent){
          if(err) return res.status('400').send(err.message);
          if (stripeEvent){
            res.status(200).send('already processed');
          } else{
            var next = function(err){
              stripeEvent = new StripeEvent();
              stripeEvent._id = event.id;
              stripeEvent.data = event;
              stripeEvent.save(function(err){
                res.status(200).send('ok');
              });
            };
            var customer, invoice;

            if(event.type === 'invoice.payment_succeeded'){
              customer = event.data.object.customer;
              invoice = event.data.object;
              User.findOne({stripeCustomer: customer}, function(err, user){
                if(err) return res.status('400').send(errorHandler.getErrorMessage(err));

                email.send(user.email, 'You have a new invoice', {invoice:invoice, name:user.displayName},
                  'modules/users/server/templates/invoice-email', next);
              });

            } else if(event.type === 'invoice.payment_failed'){
              customer = event.data.object.customer;
              invoice = event.data.object;
              User.findOne({stripeCustomer: customer}, function(err, user){
                if(err) return res.status('400').send(errorHandler.getErrorMessage(err));

                email.send(user.email, 'Your payment failed', {invoice:invoice, name:user.displayName, url:getHostUrl(req)+'/settings/billing/'},
                  'modules/users/server/templates/billing-failed-email', next);
              });

            } else if(event.type === 'customer.subscription.deleted'){
              customer = event.data.object.customer;

              User.findOneAndUpdate(
                {stripeCustomer: customer},
                {plan:'free', stripeSubscription: null},
                {new: false},
                function(err, user){
                  if(err) return res.status('400').send(errorHandler.getErrorMessage(err));

                  email.send(user.email, 'Your subscription was cancelled', {name:user.displayName},
                    'modules/users/server/templates/subscription-cancelled-email', next);
              });

            } else {
              next();
            }
          }
        });
      });
    };


    /**
     * stripe account webhook listener
     */


    exports.onStripeAccountWebhookEvent = function (req, res) {

      if(!req.body || req.body.object !== 'event' || !req.body.id) {
        return res.status('400').send('Event data not included');
      }
      if (req.body.id === 'evt_00000000000000'){
        return res.status(200).send('ok');
      }

      stripe.events.retrieve(req.body.id, { stripe_account:req.body.user_id }, function(err, event) {
        if(err) return res.status('400').send(err.message);
        StripeEvent.findById(event.id, function(err,stripeEvent){
          if(err) return res.status('400').send(err.message);
          if (!stripeEvent){
            res.status(200).send('already processed');
          } else{
            var next = function(err){
              stripeEvent = new StripeEvent();
              stripeEvent._id = event.id;
              stripeEvent.data = event;
              stripeEvent.type = event.type;
              stripeEvent.save(function(err){
                res.status(200).send('ok');
              });
            };


            if(event.type === 'account.updated'){
              var account = event.data.object,
              previous_attributes = event.data.previous_attributes;
              if(
                account.verification &&
                account.verification.fields_needed &&
                account.verification.fields_needed.length &&
                previous_attributes.verification.fields_needed
              ) {
                User.findOne({stripeAccount: account.id}, function(err, user){
                  if(err) return res.status('400').send(errorHandler.getErrorMessage(err));

                  var fieldTexts = {
                    'legal_entity.verification.document':'Upload a scan of an identifying document, such as a passport or driver’s license.',
                    'legal_entity.verification.personal_id_number':'Provide your social security number'
                  };
                  var fields = [];
                  for (var i = 0; i < account.verification.fields_needed.length; i++) {
                    fields.push(fieldTexts[account.verification.fields_needed[i]]);
                  }

                  email.send(user.email, 'We need additional information to verify your account',
                  {fields:fields, name:user.displayName, url:getHostUrl(req) + '/settings/gettingpaid/additional'},
                    'modules/users/server/templates/account-verification-email', next);
                });
              } else if (previous_attributes.charges_enabled && !account.charges_enabled) {
                User.findOne({stripeAccount: account.id}, function(err, user){
                  if(err) return res.status('400').send(errorHandler.getErrorMessage(err));
                  user.stripeChargesEnabled = false;
                  user.save(function (err){
                    email.send(user.email, 'Selling of items has been disabled',
                    {name:user.displayName, url:getHostUrl(req) + '/settings/gettingpaid/account'},
                      'modules/users/server/templates/account-charges-disabled', next);
                    });
                });
              } else if (previous_attributes.transfers_enabled && !account.transfers_enabled) {
                User.findOne({stripeAccount: account.id}, function(err, user){
                  if(err) return res.status('400').send(errorHandler.getErrorMessage(err));

                  email.send(user.email, 'Transfers to your bank account are disabled',
                  {name:user.displayName, url:getHostUrl(req) + '/settings/gettingpaid/account'},
                    'modules/users/server/templates/account-transfers-disabled', next);
                  });
              } else {
                next();
              }
            } else {
              next();
            }
          }
        });
      });
    };



    function getHostUrl(req){
      var httpTransport = 'http://';
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://';
      }
      return httpTransport + req.headers.host;
    }



    exports.getEvents = function(req, res) {
      StripeEvent.find({},function(err,events){
        res.json(events);
      });
    };
