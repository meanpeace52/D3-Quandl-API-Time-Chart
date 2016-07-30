'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller.js');

  var multer = require('multer');
  var upload = multer({
    dest: './s3-cache'
  });

  // Setting up the users profile api
  app.route('/api/users/search').get(users.search);
  app.route('/api/users/me').get(users.me);
  app.route('/api/users').put(users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);
  app.route('/api/users/files/:file').get(users.getFile);
  app.route('/api/users/files').post(upload.single('file'), users.uploadFile); // todo make main file route
  app.route('/api/users/:username').get(users.read);

  // Finish by binding the user middleware
  app.param('file', users.getFile);
  app.param('username', users.userByUsername);

};
