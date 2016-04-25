'use strict';

var AWS = require('aws-sdk');
/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {
    res.render('modules/core/server/views/index', {
        user: req.user || null
    });
};

/**
 * Render the server error page
 */
exports.renderServerError = function (req, res) {
    res.status(500).render('modules/core/server/views/500', {
        error: 'Oops! Something went wrong...'
    });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {

    res.status(404).format({
        'text/html': function () {
            res.render('modules/core/server/views/404', {
                url: req.originalUrl
            });
        },
        'application/json': function () {
            res.json({
                error: 'Path not found'
            });
        },
        'default': function () {
            res.send('Path not found');
        }
    });
};

/**
 * Create names for files, before upload to S3
 */
exports.signUploadUrl = function(req, res) {
    AWS.config.region = 'eu-west-1';
    var s3 = new AWS.S3();
    var authenticatedUrls = {};

    req.body.files.forEach(function (item) {
        var key = '{userId}/{imageCategory}/'
            .replace('{imageCategory}', item.imageCategory)
            .replace('{userId}', req.user.id);

        var s3fileName= '{userId}-{timestamp}-{filename}'
            .replace('{userId}', req.user.id)
            .replace('{timestamp}', Date.now)
            .replace('{filename}', item.filename);

        var params = {
            Bucket: process.env.S3_BUCKET,
            Expires: 60,
            Key: key + s3fileName,
            ContentType: item.contentType
        };

        authenticatedUrls[item.filename] = {
            filename: s3fileName,
            awsUrl: s3.getSignedUrl('putObject', params)
        };
    });

    return res.json(authenticatedUrls);
};
