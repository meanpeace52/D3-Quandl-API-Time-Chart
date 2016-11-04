'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller.js');
  var multer = require('multer');
  var mkdirp = require('mkdirp');
  var fs = require('fs');
  var path = require('path');

  function checkDirectorySync(directory) {
    try {
      fs.statSync(directory);
    } catch(e) {
      mkdirp.sync(directory);
    }
  }

  var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
      var filepath = 's3-cache/files/' + req.user.username;
      mkdirp.sync(path.resolve('./') + '/s3-cache/files/' + req.user.username);
      cb(null, filepath);
    }
  }),
  upload = multer({
    storage : storage
  });


  // billing and subscriptions
  app.route('/api/users/subscribe').post(users.subscribeToPlan);
  app.route('/api/users/invoices').get(users.getInvoices);
  app.route('/api/users/billing').get(users.getBillingInfo);
  app.route('/api/users/billing').put(users.updateCreditCard);
  app.route('/api/users/plans').get(users.getPlans);
  app.route('/api/users/myplan').get(users.getMyPlan);
  app.route('/api/users/mysubscription').get(users.getMySubscription);
  app.route('/api/users/account').post(users.createManagedAccount);
  app.route('/api/users/account').get(users.getMyManagedAccount);
  app.route('/api/users/account').put(users.updateMyManagedAccount);
  app.route('/api/users/account/document').post(users.uploadVerificationDocument);
  app.route('/api/users/account/bank').post(users.updateMyBankAccount);
  app.route('/api/users/testcharge').post(users.createTestCharge);
  app.route('/api/users/purchase').post(users.purchase);

  // stripe webhook route
  app.route('/api/stripe/webhook').post(users.onStripeWebhookEvent);
  app.route('/api/stripe/accountwebhook').post(users.onStripeAccountWebhookEvent);
  //app.route('/api/stripe/events').get(users.getEvents);

  // Setting up the users profile api
  app.route('/api/users/search').get(users.search);
  app.route('/api/users/me').get(users.me);
  app.route('/api/users').put(users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);
  app.route('/api/users/files').get(users.getFile);
  app.route('/api/users/files').post(upload.single('file'), users.uploadFile); // todo make main file route
  app.route('/api/users/:username').get(users.read);
  app.route('/api/users/:username/models/:model').get(users.models);
  app.route('/api/users/verify/:token').get(users.verifyEmail);
  app.route('/api/users/verify/').put(users.sendVerificationEmail);

  // Finish by binding the user middleware
  app.param('username', users.userByUsername);

};
