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

  // stripe webhook route
  app.route('/api/stripe/webhook').post(users.onStripeWebhookEvent);


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



  // Finish by binding the user middleware
  app.param('username', users.userByUsername);

};
