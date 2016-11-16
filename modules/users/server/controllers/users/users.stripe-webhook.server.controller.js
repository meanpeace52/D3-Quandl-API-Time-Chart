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
    email = require(path.resolve('./modules/core/server/services/emails.server.service')),
    accountController = require(path.resolve('./modules/users/server/controllers/users/users.gettingpaid.server.controller'));


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

                email.sendToUser(user, 'You have a new invoice', {invoice:invoice},
                  'modules/users/server/templates/invoice-email', next);
              });

            } else if(event.type === 'invoice.payment_failed'){
              customer = event.data.object.customer;
              invoice = event.data.object;
              User.findOne({stripeCustomer: customer}, function(err, user){
                if(err) return res.status('400').send(errorHandler.getErrorMessage(err));

                email.sendToUser(user, 'Your payment failed', {invoice:invoice, url:accountController.getHostUrl(req)+'/settings/billing/card'},
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

                  email.sendToUser(user, 'Your subscription was cancelled', {},
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
          if (stripeEvent){
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
                  accountController.sendAdditionalFieldsEmail(req, user, account, next);
                });
              } else if (previous_attributes.charges_enabled && !account.charges_enabled) {
                User.findOne({stripeAccount: account.id}, function(err, user){
                  if(err) return res.status('400').send(errorHandler.getErrorMessage(err));
                  user.stripeChargesEnabled = false;
                  user.save(function (err){
                    email.sendToUser(user, 'Selling of items has been disabled',
                    {url:accountController.getHostUrl(req) + '/settings/gettingpaid/account'},
                      'modules/users/server/templates/account-charges-disabled', next);
                    });
                });
              } else if (previous_attributes.transfers_enabled && !account.transfers_enabled) {
                User.findOne({stripeAccount: account.id}, function(err, user){
                  if(err) return res.status('400').send(errorHandler.getErrorMessage(err));
                  email.sendToUser(user, 'Transfers to your bank account are disabled',
                  {url:accountController.getHostUrl(req) + '/settings/gettingpaid/account'},
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


    exports.getEvents = function(req, res) {
      StripeEvent.find({type:'account.updated'},function(err,events){
        res.json(events);
      });
    };
