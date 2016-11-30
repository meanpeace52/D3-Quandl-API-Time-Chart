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
    Model = mongoose.model('Model'),
    path = require('path'),
    billingService = require(path.resolve('./modules/users/server/services/users.billing.service')),
    stripe = billingService.stripe,
    plans = billingService.plans,
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    email = require(path.resolve('./modules/core/server/services/emails.server.service')),
    dataSetsController = require(path.resolve('./modules/datasets/server/controllers/datasets.server.controller')),
    modelsController = require(path.resolve('./modules/models/server/controllers/models.server.controller'));


    /**
     * Get the user's plans
     */
    exports.getMyPlan = function (req, res) {
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      for (var i = 0; i < plans.length; i++) {
        if(billingService.plans[i].id === user.plan){
          return res.json(billingService.plans[i]);
        }
      }
      res.json({name:'Free',id:'free'});
    };




    /**
     * Get the user's subscription
     */
    exports.getMySubscription = function (req, res) {
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      if(user.stripeSubscription){
        stripe.subscriptions.retrieve(
          user.stripeSubscription,
          function(err, subscription) {
            if(err){
              billingService.handleStripeError(err, res);
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
      res.json(billingService.plans);
    };


    /**
     * Get a user's credit card
     */
    exports.getBillingInfo = function (req, res) {
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      if(user.stripeCustomer){
        stripe.customers.retrieve(
          user.stripeCustomer,
          function(err, customer) {
            if(err){
              billingService.handleStripeError(err, res);
            } else {
              res.json(billingService.returnCustomerBillingInfo(customer));
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
        billingService.updateCustomerSource(req.body.token , user.stripeCustomer, function(err, customer){
          if(err) return billingService.handleStripeError(err, res);
          res.json(billingService.returnCustomerBillingInfo(customer));
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
              billingService.handleStripeError(err, res);
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
        if(billingService.plans[i].stripe_id === req.body.plan){
          stripe_plan = billingService.plans[i].stripe_id;
          user_plan = billingService.plans[i].id;
        }
      }
      if(!stripe_plan) return res.status(400).json({message:'plan not found'});

      var confirm = function (err, subscription_id){
        if (err) return res.status(400).json({message:err.message});
        res.json(user_plan);
      };

      if(user.stripeCustomer){
        if(req.body.token){
          billingService.updateCustomerSource(req.body.token , user.stripeCustomer, function(err, customer){
            if(err) return billingService.handleStripeError(err, res);
            billingService.subscribeOrUpdateUserPlan(user, stripe_plan, user_plan, confirm);
          });
        }else{
          billingService.subscribeOrUpdateUserPlan(user, stripe_plan, user_plan, confirm);
        }
      } else {
        billingService.createCustomer(
          req.body.token,
          user,
          function(err, customer){
            if(err) return billingService.handleStripeError(err, res);
            user.stripeCustomer = customer.id;
            billingService.subscribeOrUpdateUserPlan(user, stripe_plan, user_plan, confirm);
          }
        );
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
              if (err) return billingService.handleStripeError(err, res);
              return res.json({success:true});
            });
        };
        if(req.body.token){
          if(user.stripeCustomer){
            billingService.updateCustomerSource(req.body.token , user.stripeCustomer, next);
          } else{
            billingService.createCustomer(req.body.token , user, next);
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


    /**
     * Purchase Item from a managed account
     */

    exports.purchase = function(req, res){
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      if (!req.body.type) return res.status(400).json({message:'The type of the purchased object is needed'});
      if (!req.body.id) return res.status(400).json({message:'The id of the purchased object is needed'});

      if(req.body.type === 'dataset') {
          Dataset.findById(req.body.id).populate('user').exec(function (err, dataset) {
              if (err) return res.status(400).json({message: errorHandler.getErrorMessage(err)});

              //purchase the item and hook into the datasetController
              billingService.purchaseItem(dataset, req.body.type, req.body.token, user, function (err, charge) {
                  if (err) return res.status(400).json({message: err.message});
                  dataSetsController.purchaseDataset(dataset._id, user, function (err, dataset) {
                      if (err) return res.status(400).json({message: errorHandler.getErrorMessage(err)});
                      return res.json(true);
                  });
              });
          });
      }
      else if (req.body.type === 'model') {
          Model.findById(req.body.id).populate('user').exec(function (err, model) {
              if (err) return res.status(400).json({message: errorHandler.getErrorMessage(err)});

              //purchase the item and hook into the modelsController
              billingService.purchaseItem(model, req.body.type, req.body.token, user, function (err, charge) {
                  if (err) return res.status(400).json({message: err.message});
                  modelsController.purchaseModel(model._id, user, function (err, dataset) {
                      if (err) return res.status(400).json({message: errorHandler.getErrorMessage(err)});
                      return res.json(true);
                  });
              });
          });
      } else {
        return res.status(400).json({message:'This type is not for sale'});
      }
    };
