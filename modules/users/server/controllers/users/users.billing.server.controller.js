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
    email = require(path.resolve('./modules/core/server/controllers/emails.server.controller')),
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
     * create stripe managed account
     */
    exports.createManagedAccount = function (req, res) {
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      var data = {
        managed: true,
        country: 'US',
        legal_entity:req.body.legal_entity,
        tos_acceptance: {
          date: Math.floor(Date.now() / 1000),
          ip: req.connection.remoteAddress
        },
        external_account: {
          object:'bank_account',
          account_number:req.body.external_account.account_number,
          routing_number:req.body.external_account.routing_number,
          country:'US'
        },
        metadata: req.body.meta
      };
      stripe.accounts.create(data, function(err, account) {
        if(err) return res.status(400).json({message:err.message});
        user.stripeAccount = account.id;
        user.save(function(err, user){
          if(err) return res.status(400).json({message:errorHandler.getErrorMessage(err)});
          res.json(account);
        });
      });
    };


    /**
     * create stripe managed account
     */
    exports.getMyManagedAccount = function (req, res) {
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      if (user.stripeAccount){
        stripe.accounts.retrieve(
          user.stripeAccount,
          function(err, account) {
            if(err) return res.status(400).json({message:err.message});
            res.json(account);
          }
        );
      } else {
        res.json({});
      }
    };


    /**
     * update stripe managed account
     */
    exports.updateMyManagedAccount = function (req, res) {
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      if (user.stripeAccount){
        var data ={legal_entity:req.body.legal_entity, metadata: req.body.meta};
        if(req.body.meta) data.metadata = req.body.meta;
        stripe.accounts.update(user.stripeAccount, data,
          function(err, account) {
            if(err) return res.status(400).json({message:err.message});
            res.json(account);
          }
        );
      } else {
        res.status(400).json({message:'User has no account'});
      }
    };

    /**
     * update bank account
     */
    exports.updateMyBankAccount = function (req, res) {
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      if (user.stripeAccount){
        stripe.accounts.retrieve(
          user.stripeAccount,
          function(err, account) {
            if(err) return res.status(400).json({message:err.message});

            stripe.accounts.createExternalAccount(
              user.stripeAccount,
              { external_account:{
                  object:'bank_account',
                  account_number:req.body.external_account.account_number,
                  routing_number:req.body.external_account.routing_number,
                  country:'US',
                  currency:'usd',
                  default_for_currency:true
                }
              },
              function(err, bank_account) {
                if(err) return res.status(400).json({message:err.message});
                for (var i = 0; i < account.external_accounts.data.length; i++) {
                  stripe.accounts.deleteExternalAccount(user.stripeAccount,account.external_accounts.data[i].id);
                }
                res.json(bank_account);
              }
            );
          }
        );
      } else {
        res.status(400).json({message:'User has no account'});
      }
    };

    /**
     * upload identity verification document
     */
    exports.uploadVerificationDocument = function (req, res) {
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      if (!user.stripeAccount) return res.status(400).json({message:'User has no account'});
      var upload = multer(config.uploads.stripeUpload).single('newAccountDocument');
      var stripeUploadFileFilter = require(path.resolve('./config/lib/multer')).stripeUploadFileFilter;
      upload.fileFilter = stripeUploadFileFilter;
      upload(req, res, function (uploadError) {
          if (uploadError) return res.status(400).send({message: 'Error occurred while uploading document'});
          stripe.fileUploads.create({
            purpose: 'identity_document',
            file: {
              data: fs.readFileSync(req.file.path),
              name: req.file.filename,
              type: 'application/octet-stream' }
            },
            {stripe_account: user.stripeAccount},
            function(err, fileUpload) {
              fs.unlinkSync(req.file.path);
              if(err) return handleStripeError(err, res);
              stripe.accounts.update(
                user.stripeAccount,
                {legal_entity: {verification: {document: fileUpload.id}}},
                function(err, account){
                  if(err) return handleStripeError(err, res);
                  res.json(account);
            });
          });
      });
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
        res.json([]);
      }
    };


    /**
     * Get a user's credit card
     */
    exports.updateCreditCard = function (req, res) {
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      if(user.stripeCustomer){
        stripe.customers.createSource(
          user.stripeCustomer,
          {source: req.body.token },
          function(err, card) {
            if(err){
              handleStripeError(err, res);
            } else {
              stripe.customers.update(user.stripeCustomer, {
                default_source: card.id
              }, function(err, customer) {
                res.json(returnCustomerBillingInfo(customer));
              });
            }
          }
        );
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
      if(!user.stripeCustomer){
        stripe.customers.createSource(
          user.stripe_customer,
          {source: req.body.token },
          function(err, card) {
            if(err) return handleStripeError(err, res);
            stripe.customers.update(user.stripeCustomer, {
              default_source: card.id
            }, function(err, customer) {
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
            });
          }
        );
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


    /**
     * create a charge on a managed account
     */
    exports.createTestCharge = function (req, res) {
      var user = req.user;
      if (!user) return res.status(400).json({message:'User is not signed in'});
      if (user.stripeAccount){
        stripe.charges.create({
            amount: 1000,
            currency: 'usd',
            source: req.body.token,
            destination : user.stripeAccount,
            application_fee : 200,
            description: 'test charge for ' + user.email
          }, function(err, charge) {
            if (err) return handleStripeError(err, res);
            return res.json({success:true});
          });
      }else{
        res.status(400).json({message:'user has no account'});
      }
    };




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
              User.findOne({stripe_customer: customer}, function(err, user){
                if(err) return res.status('400').send(errorHandler.getErrorMessage(err));

                email.send(user.email, 'You have a new invoice', {invoice:invoice, name:user.displayName},
                  'modules/users/server/templates/invoice-email', next);
              });

            } else if(event.type === 'invoice.payment_failed'){
              customer = event.data.object.customer;
              invoice = event.data.object;
              User.findOne({stripe_customer: customer}, function(err, user){
                if(err) return res.status('400').send(errorHandler.getErrorMessage(err));

                email.send(user.email, 'Your payment failed', {invoice:invoice, name:user.displayName},
                  'modules/users/server/templates/billing-failed-email', next);
              });

            } else if(event.type === 'customer.subscription.deleted'){
              customer = event.data.object.customer;

              User.findOneAndUpdate(
                {stripe_customer: customer},
                {plan:'free', stripe_subscription: null},
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
       source: token // obtained with Stripe.js
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
     console.log(err);
     if(err.statusCode){
       res.status(err.statusCode).json({message:err.message});
     }else{
       res.status(500).json({message:'Semething went wrong while processing your data'});
     }

   }
