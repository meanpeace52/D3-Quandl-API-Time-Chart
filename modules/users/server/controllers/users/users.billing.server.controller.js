'use strict';

/**
 * Module dependencies.
 */

var path = require('path'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    User = mongoose.model('User'),
    path = require('path'),
    config = require(path.resolve('./config/config')),
    stripe = require('stripe')(config.stripe.secret_key),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var plans = [
      {name:'Premium', price:9.99,id:'premium',stripe_id:'premium', period:'monthly'},
      {name:'Small Business', price:16.99,id:'small_business',stripe_id:'small_business', period:'monthly'},
      {name:'Enterprise', price:29.99,id:'enterprise', stripe_id:'enterprise', period:'monthly'}
    ];



    /**
     * Get the user's plans
     */
    exports.getMyPlan = function (req, res) {
      var user = req.user;
      for (var i = 0; i < plans.length; i++) {
        if(plans[i].id == user.plan){
          res.json(plans[i]);
          break;
        }
      }
      res.json({name:'Free',id:'free'});
    };

    /**
     * Get the user's subscription
     */
    exports.getMySubscription = function (req, res) {
      var user = req.user;
      if(user.stripe_subscription){
        stripe.subscriptions.retrieve(
          user.stripe_subscription,
          function(err, subscription) {
            if(err){
              res.status(400).json(err);
            } else {
              res.json(subscription);
            }
          }
        );
      } else{
        res.json({});
      }
    };


    /**
     * Get the available plans
     */
    exports.getPlans = function (req, res) {
      res.json(plans);
    };


    /**
     * Get a user's credit card
     */
    exports.getBillingInfo = function (req, res) {
      var user = req.user;
      if(user.stripe_customer){
        stripe.customers.retrieve(
          user.stripe_customer,
          function(err, customer) {
            if(err){
              res.status(400).json(err);
            } else {
              for (var i = 0; i < customer.sources.data.length; i++) {
                if(customer.sources.data[i].id == customer.default_source){
                  var fields = ['last4','brand','country','exp_month','exp_year','funding','name'];
                  var billing = {};
                  for (var j = 0; j < fields.length; j++) {
                    billing[fields[j]] = customer.sources.data[i][fields[j]];
                  }
                  res.json(billing);
                }
              }
            }
          }
        );
      }else{
        res.json([]);
      }
    };

    /**
     * Get a user's invoices
     */
    exports.getInvoices = function (req, res) {
      var user = req.user;
      if(user.stripe_customer){
        stripe.invoices.list(
          { limit: 100,customer:user.stripe_customer },
          function(err, invoices) {
            if(err){
              res.status(400).json(err);
            } else {
              res.json(invoices.data);
            }
          }
        );
      }else{
        res.json([]);
      }
    };




   /**
    * Subscribe a user to a plan
    */
    exports.subscribeToPlan = function (req, res) {
      var user = req.user;
      if (user) {
        if(user.stripe_customer){
          stripe.customers.createSource(
            user.stripe_customer,
            {source: req.body.token },
            function(err, card) {
              if(err){
                res.status(400).json(err);
              } else {
                stripe.customers.update(user.stripe_customer, {
                  default_source: card.id
                }, function(err, customer) {
                  if(user.stripe_subscription){
                    stripe.subscriptions.update(
                      user.stripe_subscription,
                      { plan: req.body.plan.id },
                      function(err, subscription) {
                        if(err){
                          res.status(400).json(err);
                        } else {
                          res.json(subscription.id);
                        }
                      }
                    );
                  }else{
                    subscribeCustomerToPlan(
                      user.stripe_customer,
                      req.body.plan.stripe_id,
                      req.body.plan.id,
                      user,
                      function(err, subscription_id){
                        if(err){
                          res.status(400).json(err);
                        } else {
                          res.json(subscription_id);
                        }
                      }
                    );
                  }
                });
              }
            }
          );
        } else {
          createCustomer(
            req.body.token,
            user,
            function(err, customer_id){
              if(err){
                res.status(400).json(err);
              } else {
                subscribeCustomerToPlan(
                  customer_id,
                  req.body.plan.stripe_id,
                  req.body.plan.id,
                  user,
                  function(err, subscription_id){
                    if(err){
                      res.status(400).json(err);
                    } else {
                      res.json(subscription_id);
                    }
                  }
                );
              }
            }
          );
        }
      } else {
        res.status(400).json('user not logged in');
      }
    };

    function subscribeCustomerToPlan(customer_id, plan_id, plan, user , next){
       stripe.subscriptions.create({
         customer: customer_id,
         plan: plan_id
       }, function(err, subscription) {
         if(err){
           next(err);
         } else {
           user.stripe_subscription = subscription.id;
           user.plan = plan;
           user.save(function (err) {
             if (err) {
               next(err);
             } else {
               next(err, subscription.id);
             }
           });
         }
      });
   }


   function createCustomer(token, user, next){
     stripe.customers.create({
       description: 'Customer for '+ user.email,
       source: token // obtained with Stripe.js
     }, function(err, customer) {
       if(err){
         next(err);
       } else {
         user.stripe_customer = customer.id;
         user.save(function (err) {
           if (err) {
             next(err);
           } else {
             next(err, customer.id);
           }
         });
        }
      });
   }
