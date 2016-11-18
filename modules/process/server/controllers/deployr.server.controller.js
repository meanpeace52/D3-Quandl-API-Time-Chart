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

    var s3reference = req.body.processData.selecteddatasets3reference.replace('https://s3.amazonaws.com/datasetstl', '');

    generator.setS3Configuration(config.s3AccessKeyId, config.s3SecretAccessKey, 'datasetstl')
        .loads3File(s3reference, 'csvfile')
        .loadCsvFile('csvfile', 'dataset');

    _.each(req.body.tasks, function(task){
        if (task.title === 'Linear Regression'){
            generator
                .linearRegression(config.s3AccessKeyId, config.s3SecretAccessKey, 'datasetstl', s3reference, parseInt(task.options.yColIndex + 1, 10));
        }
        else if (task.title === 'Initial Transformations'){
            _.each(task.options.transformSteps, function(step){
                if (step.type === 'drop'){
                    //Exclude any undefined columns
                    step.columnindexes = _.filter(step.columnindexes, function(i){
                        return i > -1;
                    });

                    // Add one to index as R is not 0 based
                    generator.dropColumns('dataset', step.columnindexes.map(function(column){
                        return column + 1;
                    }).join(','));
                }
                else if (step.type === 'rename') {
                    generator.renameColumns('dataset', step.newcolumnnames.map(function(column){
                        return '"' + column.replace(/"/g, '\\"') + '"';
                    }).join(','));
                }
            });
        }
    });

    generator
        .saveCVSToS3File('dataset', '/test12345/12345', 'csv', 'datasetstl', 'savedfile');

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
