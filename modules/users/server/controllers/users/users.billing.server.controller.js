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
      {name:'Premium', price:10,id:'premium',stripe_id:'premium_monthly', period:1},
      {name:'Small Business', price:60,id:'small_business',stripe_id:'small_business_monthly', period:1},
      {name:'Enterprise', price:200,id:'enterprise', stripe_id:'enterprise_monthly', period:1},
      {name:'Premium', price:50,id:'premium',stripe_id:'premium6', period:6},
      {name:'Small Business', price:290,id:'small_business',stripe_id:'small_business6', period:6},
      {name:'Enterprise', price:950,id:'enterprise', stripe_id:'enterprise6', period:6},
      {name:'Premium', price:80,id:'premium',stripe_id:'premium_yearly', period:12},
      {name:'Small Business', price:450,id:'small_business',stripe_id:'small_business_yearly', period:12},
      {name:'Enterprise', price:1400,id:'enterprise', stripe_id:'enterprise_yearly', period:12}
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
              res.status(400).json(err.message);
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
              res.status(400).json(err.message);
            } else {
              res.json(returnCustomerBillingInfo(customer));
            }
          }
        );
      }else{
        res.json([]);
      }
    };


    /**
     * Get a user's credit card
     */
    exports.updateCreditCard = function (req, res) {
      var user = req.user;
      if(user.stripe_customer){
        stripe.customers.createSource(
          user.stripe_customer,
          {source: req.body.token },
          function(err, card) {
            if(err){
              res.status(400).json(err.message);
            } else {
              stripe.customers.update(user.stripe_customer, {
                default_source: card.id
              }, function(err, customer) {
                res.json(returnCustomerBillingInfo(customer));
              });
            }
          }
        );
      }else{
        res.status(400).json('no user or customer');
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
              res.status(400).json(err.message);
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
      var user = req.user, stripe_plan, user_plan;
      for (var i = 0; i < plans.length; i++) {
        if(plans[i].stripe_id == req.body.plan){
          stripe_plan = plans[i].stripe_id;
          user_plan = plans[i].id;
        }
      }
      if(!stripe_plan){
        res.status(400).json('plan not found');
      }
      if (user) {
        if(user.stripe_customer){
          stripe.customers.createSource(
            user.stripe_customer,
            {source: req.body.token },
            function(err, card) {
              if(err){
                res.status(400).json(err.message);
              } else {
                stripe.customers.update(user.stripe_customer, {
                  default_source: card.id
                }, function(err, customer) {
                  if(user.stripe_subscription){

                    updateSubscription(
                      user.stripe_subscription,
                      stripe_plan,
                      user_plan,
                      user,
                      function(err, subscription_id){
                        if(err){
                          res.status(400).json(err.message);
                        } else {
                          res.json(user_plan);
                        }
                      }
                    );





                  }else{
                    subscribeCustomerToPlan(
                      user.stripe_customer,
                      stripe_plan,
                      user_plan,
                      user,
                      function(err, subscription_id){
                        if(err){
                          res.status(400).json(err.message);
                        } else {
                          res.json(user_plan);
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
                res.status(400).json(err.message);
              } else {
                subscribeCustomerToPlan(
                  customer_id,
                  stripe_plan,
                  user_plan,
                  user,
                  function(err, subscription_id){
                    if(err){
                      res.status(400).json(err.message);
                    } else {
                      res.json(user_plan);
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


   function updateSubscription(subscription_id, plan_id, plan, user , next){
     stripe.subscriptions.update(
       subscription_id,
       { plan: plan_id },
       function(err, subscription) {
         if(err){
           next(err);
         } else {
           stripe.invoices.create({
              customer: subscription.customer
            }, function(err, invoice) {
              user.plan = plan;
              user.save(function (err) {
                if (err) {
                  next(err);
                } else {
                  next(err, subscription.id);
                }
              });
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

   function returnCustomerBillingInfo(customer){
     for (var i = 0; i < customer.sources.data.length; i++) {
       if(customer.sources.data[i].id == customer.default_source){
         var fields = ['last4','brand','country','exp_month','exp_year','funding','name'];
         var billing = {};
         for (var j = 0; j < fields.length; j++) {
           billing[fields[j]] = customer.sources.data[i][fields[j]];
         }
         return billing;
       }
     }
   }
