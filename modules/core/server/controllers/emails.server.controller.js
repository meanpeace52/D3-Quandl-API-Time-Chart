'use strict';


var path = require('path'),
    config = require(path.resolve('./config/config')),
    nodemailer = require('nodemailer'),
    sesTransport = require('nodemailer-ses-transport');

var mailTransport = nodemailer.createTransport(sesTransport({
    AWSAccessKeyID: config.mailer.options.accessKeyId,
    AWSSecretKey:  config.mailer.options.secretAccessKey,
    SeviceUrl: config.mailer.options.SeviceUrl,
    rateLimit: config.mailer.options.rateLimit
}));


/**
 * send email
 */

 exports.send = function (to, subject, merge, template, res, next) {
   merge.appName = config.app.title;
   res.render(
     path.resolve(template),
     merge,
     function (err, html) {
       if(err) return next(err);
       var mailOptions = {
         to: to,
         from: config.mailer.from,
         subject: subject,
         html: html
       };

       mailTransport.sendMail(mailOptions, function (err) {
         next(err);
       });
     });
 };
