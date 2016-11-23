'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    deployr = require('deployr'),
    _ = require('lodash'),
    datasetS3service = require(path.resolve('./modules/datasets/server/services/datasets.server.s3')),
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

    var outputFileKey = '/' + req.user.username + '/' + (new Date().getTime()).toString(16);

    _.each(req.body.tasks, function(task){
        if (task.title === 'Linear Regression'){
            generator
                .saveCSVToS3File('dataset', outputFileKey, 'csv', 'datasetstl', 'savedfile');

            generator
                .linearRegression(config.s3AccessKeyId, config.s3SecretAccessKey, 'datasetstl', s3reference, parseInt(task.options.yColIndex, 10) + 1, outputFileKey);
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

    if (!generator.transformedDataset){
        generator
            .saveCSVToS3File('dataset', outputFileKey, 'csv', 'datasetstl', 'savedfile');
    }

    generator
        .execute(config.deployrHost, config.deployrUsername, config.deployrPassword)
        .then(function(result){
            if (generator.transformedDataset) {
                datasetS3service.readWithS3('https://s3.amazonaws.com/datasetstl' + outputFileKey + '.csv')
                    .then(function(data){
                        result.dataset = data;
                        result.dataset.rows = _.take(result.dataset.rows, 10);
                        response.json(result);
                    })
                    .catch(function(err){
                        response.status(500).json(err);
                    });
            }
            else{
                response.json(result);
            }

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
