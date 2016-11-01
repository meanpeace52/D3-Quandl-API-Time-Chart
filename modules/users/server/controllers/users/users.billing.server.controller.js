'use strict';

/**
 * Module dependencies.
 */

var path = require('path'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    User = mongoose.model('User'),
    StripeEvent = mongoose.model('StripeEvent'),
    Dataset = mongoose.model('Dataset'),
    path = require('path'),
    config = require(path.resolve('./config/config')),
    stripe = require('stripe')(config.stripe.secret_key),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    email = require(path.resolve('./modules/core/server/controllers/emails.server.controller')),
    dataSetsController = require(path.resolve('./modules/datasets/server/controllers/datasets.server.controller')),
    multer = require('multer'),
    fs = require('fs');

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
      if (!user) return res.status(400).json({message:'User is not signed in'});
      for (var i = 0; i < plans.length; i++) {
        if(plans[i].id === user.plan){
          return res.json(plans[i]);
        }
      }
      res.json({name:'Free',id:'free'});
    };




    /**
     * Get the user's subscription
     */
    exports.getMySubscription = function (req, res) {
      var user = req.user;
      if(user.stripeSubscription){
        stripe.subscriptions.retrieve(
          user.stripeSubscription,
          function(err, subscription) {
            if(err){
              handleStripeError(err, res);
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
      if(user.stripeCustomer){
        stripe.customers.retrieve(
          user.stripeCustomer,
          function(err, customer) {
            if(err){
              handleStripeError(err, res);
            } else {
              res.json(returnCustomerBillingInfo(customer));
            }
          }
        );
      }else{
        res.json(false);
      }
    };


    /**
     * Update a user's credit card
     */
    exports.updateCreditCard = function (req, res) {
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      if(user.stripeCustomer){
        updateCustomerSource(req.body.token , user.stripeCustomer, function(err, customer){
          if(err) return handleStripeError(err, res);
          res.json(returnCustomerBillingInfo(customer));
        });
      }else{
        res.status(400).json({message:'user has no stripe customer'});
      }
    };



    /**
     * Get a user's invoices
     */
    exports.getInvoices = function (req, res) {
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      if(user.stripeCustomer){
        stripe.invoices.list(
          { limit: 100,customer:user.stripeCustomer },
          function(err, invoices) {
            if(err){
              handleStripeError(err, res);
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
      if (!user) return res.status(400).json({message:'User is not signed in'});
      for (var i = 0; i < plans.length; i++) {
        if(plans[i].stripe_id === req.body.plan){
          stripe_plan = plans[i].stripe_id;
          user_plan = plans[i].id;
        }
      }
      if(!stripe_plan) return res.status(400).json({message:'plan not found'});
      if(user.stripeCustomer){
        var next = function (err, customer){
          if (err) return handleStripeError(err, res);
          if(user.stripeSubscription){
            updateSubscription(
              user.stripeSubscription,
              stripe_plan,
              user_plan,
              user,
              function(err, subscription_id){
                if(err) return handleStripeError(err, res);
                res.json(user_plan);
              }
            );
          }else{
            subscribeCustomerToPlan(
              user.stripeCustomer,
              stripe_plan,
              user_plan,
              user,
              function(err, subscription_id){
                if(err) return handleStripeError(err, res);
                res.json(user_plan);
              }
            );
          }
        };
        if(req.body.token){
          updateCustomerSource(req.body.token , user.stripeCustomer, next);
        }else{
          next();
        }
      } else {
        createCustomer(
          req.body.token,
          user,
          function(err, customer_id){
            if(err) return handleStripeError(err, res);
            subscribeCustomerToPlan(
              customer_id,
              stripe_plan,
              user_plan,
              user,
              function(err, subscription_id){
                if(err) return handleStripeError(err, res);
                res.json(user_plan);
              }
            );
          }
        );
      }
    };





    exports.purchase = function(req, res){
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      if (!req.body.type) return res.status(400).json({message:'The type of the purchased object is needed'});
      if (!req.body.id) return res.status(400).json({message:'The id of the purchased object is needed'});

      var createCharge = function(item, type){
        if (!item.user.stripeAccount) return res.status(400).json({message:'The item seller has no stripe account'});
        if (!item.user.stripeChargesEnabled) return res.status(400).json({message:'The item seller is not able to charge'});
        var charge = {
          amount: item.cost * 100,
          currency: 'usd',
          destination : item.user.stripeAccount,
          application_fee : item.cost * 100 * 0.2,
          description: 'purchase of '+item.title+'  by ' + user.email,
          metadata:{
            id:item._id.toString(),
            user:user._id.toString(),
            type:type
          }
        };
        var next = function(err, customer){
          charge.customer = customer.id;
          stripe.charges.create(charge, function(err, charge) {
              if (err) return handleStripeError(err, res);
              dataSetsController.purchaseDataset(item._id, user, function(err,dataset){
                if (err) return res.status(400).json({message: errorHandler.getErrorMessage(err)});
                return res.json(dataset);
              });
            });
        };
        if(req.body.token){
          if(user.stripeCustomer){
            updateCustomerSource(req.body.token , user.stripeCustomer, next);
          } else{
            createCustomer(req.body.token , user, next);
          }
        } else if(user.stripeCustomer){
          charge.customer = user.stripeCustomer;
          next(null, {id:user.stripeCustomer});
        } else {
          return res.status(400).json({message:'please provide a credit card'});
        }
      };

      if(req.body.type == 'dataset'){
        Dataset.findById(req.body.id).populate('user').exec(function(err, dataset){
          if (err) return res.status(400).json({message: errorHandler.getErrorMessage(err)});
          createCharge(dataset, 'dataset');
        });
      }
    };



    /**
     * create a charge on a managed account
     */
    exports.createTestCharge = function (req, res) {
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      if (user.stripeAccount){
        var charge = {
          amount: 1000,
          currency: 'usd',
          destination : user.stripeAccount,
          application_fee : 200,
          description: 'test charge for ' + user.email
        };
        var next = function(err, customer){
          charge.customer = customer.id;
          stripe.charges.create(charge, function(err, charge) {
              if (err) return handleStripeError(err, res);
              return res.json({success:true});
            });
        };
        if(req.body.token){
          if(user.stripeCustomer){
            updateCustomerSource(req.body.token , user.stripeCustomer, next);
          } else{
            createCustomer(req.body.token , user, next);
          }
        } else if(user.stripeCustomer){
          charge.customer = user.stripeCustomer;
          next(null, {id:user.stripeCustomer});
        } else {
          return res.status(400).json({message:'please provide a credit card'});
        }

      }else{
        res.status(400).json({message:'user has no account'});
      }
    };



    function updateCustomerSource(token , customer_id, next){
      stripe.customers.createSource(
        customer_id,
        {source: token },
        function(err, card) {
          if(err){
            next(err);
          } else {
            stripe.customers.update(customer_id, {
              default_source: card.id
            }, function(err, customer) {
              if (err) return next(err);
              for (var i = 0; i < customer.sources.data.length; i++) {
               if(customer.default_source != customer.sources.data[i].id){
                 stripe.customers.deleteCard(customer.id, customer.sources.data[i].id);
               }
              }
              next(null, customer);
            });
          }
        }
      );
    }

    function subscribeCustomerToPlan(customer_id, plan_id, plan, user , next){
       stripe.subscriptions.create({
         customer: customer_id,
         plan: plan_id
       }, function(err, subscription) {
         if(err){
           next(err);
         } else {
           user.stripeSubscription = subscription.id;
           user.plan = plan;
           user.save(function (err) {
             if (err) {
               next({message: errorHandler.getErrorMessage(err)});
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
                  next({message: errorHandler.getErrorMessage(err)});
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
       source: token
     }, function(err, customer) {
       if(err){
         next(err);
       } else {
         user.stripeCustomer = customer.id;
         user.save(function (err) {
           if (err) {
             next({message: errorHandler.getErrorMessage(err)});
           } else {
             next(err, customer.id);
           }
         });
        }
      });
   }



   function returnCustomerBillingInfo(customer){
     for (var i = 0; i < customer.sources.data.length; i++) {
       if(customer.sources.data[i].id === customer.default_source){
         var fields = ['last4','brand','country','exp_month','exp_year','funding','name'];
         var billing = {};
         for (var j = 0; j < fields.length; j++) {
           billing[fields[j]] = customer.sources.data[i][fields[j]];
         }
         return billing;
       }
     }
   }

   function handleStripeError(err, res){
     if(err.statusCode){
       res.status(err.statusCode).json({message:err.message});
     }else{
       res.status(500).json({message:'Something went wrong while processing your data'});
     }
   }
