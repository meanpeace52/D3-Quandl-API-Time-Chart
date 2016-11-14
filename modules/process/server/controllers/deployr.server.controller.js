'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    deployr = require('deployr'),
    _ = require('lodash'),
    RCodeGenerator = require('../services/generate-r.services.server.js');

/**
 * List processes
 */
exports.deployrRun = function (req, response) {

    var generator = new RCodeGenerator();

    _.each(req.body.tasks, function(task){
        if (task.title === 'Linear Regression'){
            generator
                .linearRegression(config.s3AccessKeyId, config.s3SecretAccessKey, 'datasetstl', '/test12345/34130f79766ca9afc495f6eea8cf7d58.csv', parseInt(task.options.yColIndex + 1, 10));
        }
    });

    generator
        .execute(config.deployrHost, config.deployrUsername, config.deployrPassword)
        .then(function(result){
            response.json(result);
        })
        .catch(function(err){
            response.status(500).json(err);
        });

    /*
    deployr.configure({ host: config.deployrHost });

    deployr.io('/r/user/login')
        .data({ username: config.deployrUsername, password: config.deployrPassword })
        .error(function(err) {
            response.status(500).send(err.deployr.response);
        })
        .end()
        .io('/r/repository/script/render')
            .data({ filename: req.body.filename, author: 'testuser', echooff : true })
            .rinputs(req.body.rinputs)
            //.routputs(req.body.routputs)
            .error(function(err) {
                response.status(500).send(err.deployr.response);
            })
            .end(function(result) {
                // handle successful response
                response.send(result);
            });*/

};
