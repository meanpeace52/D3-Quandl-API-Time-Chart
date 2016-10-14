'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    deployr = require('deployr');


/**
 * List processes
 */
exports.deployrRun = function (req, response) {
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
            });

};
