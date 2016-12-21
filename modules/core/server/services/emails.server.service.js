'use strict';


var path = require('path'),
    config = require(path.resolve('./config/config')),
    nodemailer = require('nodemailer'),
    sesTransport = require('nodemailer-ses-transport'),
    crypto = require('crypto'),
    swig = require('swig');

var mailTransport = nodemailer.createTransport(sesTransport({
    AWSAccessKeyID: config.mailer.options.accessKeyId,
    AWSSecretKey:  config.mailer.options.secretAccessKey,
    SeviceUrl: config.mailer.options.SeviceUrl,
    rateLimit: config.mailer.options.rateLimit
}));

/**
 * send email
 */

function send(to, subject, merge, template, next) {
   merge.appName = config.app.title;
   var mailOptions = {
     to: to,
     from: config.mailer.from,
     subject: subject,
     html: swig.compileFile(path.resolve(template+'.server.view.html'))(merge)
   };
   mailTransport.sendMail(mailOptions, function (err) {
     next(err);
   });
 }

 /**
  * send email to specific user
  */

 function sendToUser(user, subject, merge, template, next) {
    merge.name = user.displayName;
    send(user.email, subject, merge, template, next);
 }


 /**
  * verify user email
  */

  function verifyEmail(req, user, next) {
     crypto.randomBytes(20, function (err, buffer) {
         var token = buffer.toString('hex');
         user.verifyEmailToken = token;
         user.save(function (err) {
             var httpTransport = 'http://';
             if (config.secure && config.secure.ssl === true) {
                 httpTransport = 'https://';
             }
             send(user.email, 'Please verify your email', {
                     name: user.displayName,
                     url: httpTransport + req.headers.host + '/api/users/verify/' + user.verifyEmailToken
                 },
                 'modules/users/server/templates/verify-email',
                 function (err) {
                     if (!err) {
                         next();
                     } else {
                         next({message: 'Failure sending email'});
                     }
                 });
         });
     });
 }

 /**
 * send email to profile user
 */
 function sendToProfileUser(user, sender, subject, message, next) {
     var template = 'modules/users/server/templates/send-profile-email',
         merge = {
             username: user.username,
             senderusername: sender.username,
             senderemail: sender.email,
             message: message,
             appName: config.app.title
         };
     send(user.email, subject, merge, template, next);
 }

 module.exports = {
     verifyEmail:verifyEmail,
     send:send,
     sendUser:sendToUser,
     sendToProfileUser: sendToProfileUser
 };
