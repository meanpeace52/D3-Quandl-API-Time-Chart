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
        transfer_schedule: {
          delay_days: 2,
          interval: 'monthly',
          monthly_anchor:15
        },
        metadata:{
          user_id:user._id.toString(),
          email:user.email,
          type:req.body.meta.type
        },
        external_account: {
          object:'bank_account',
          account_number:req.body.external_account.account_number,
          routing_number:req.body.external_account.routing_number,
          country:'US'
        }
      };

      stripe.accounts.create(data, function(err, account) {
        if(err) return res.status(400).json({message:err.message});
        user.stripeAccount = account.id;
        user.save(function(err, user){
          if(err) return res.status(400).json({message:errorHandler.getErrorMessage(err)});
          res.json(returnAccount(account));
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



    function returnAccount(account){
      var fields=['external_accounts','legal_entity','metadata','verification','charges_enabled','transfers_enabled'];
      var a = {};
      for (var i = 0; i < fields.length; i++) {
        a[fields[i]] = account[fields[i]];
      }
      return a;
    }



    function handleStripeError(err, res){
      if(err.statusCode){
        res.status(err.statusCode).json({message:err.message});
      }else{
        res.status(500).json({message:'Something went wrong while processing your data'});
      }
    }
