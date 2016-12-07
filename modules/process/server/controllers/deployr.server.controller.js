'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Dataset = mongoose.model('Dataset'),
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
        .loadCsvFile('csvfile', 'dataset', req.body.processData.hasheader);

    var outputFileKey = '/' + req.user.username + '/' + (new Date().getTime()).toString(16);

    var endPoint = _.find(req.body.tasks, { endpoint : true });
    var endPointIndex = _.indexOf(req.body.tasks, endPoint);
    req.body.tasks = _.take(req.body.tasks, endPointIndex + 1);

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
                else if (step.type === 'removerowswithmissingdata') {
                    generator.removeNA('dataset');
                }
                else if (step.type === 'logtransform') {
                    generator.logTransform('dataset');
                }
                else if (step.type === 'merge'){
                    if (step.source === 'dataset'){
                        var datasets3reference = step.dataset.s3reference.replace('https://s3.amazonaws.com/datasetstl', '');

                        generator
                            .loads3File(datasets3reference, 'csvfile')
                            .loadCsvFile('csvfile', 'mergedataset')
                            .renameColumns('mergedataset', step.renamedcolumns.map(function(column){
                                return '"' + column.replace(/"/g, '\\"') + '"';
                            }).join(','));

                        if (step.dropcolumns && step.dropcolumns.length > 0){
                            generator.dropColumns('mergedataset', step.dropcolumns.map(function(column){
                                return column;
                            }).join(','));
                        }

                        generator.mergeDataset('dataset', step.destinationkeyfieldindex, 'mergedataset', step.keyfieldindex);
                    }
                    else{
                        var modeldatasets3reference = step.datasets3reference.replace('https://s3.amazonaws.com/datasetstl', '');
                        generator
                            .loads3File(modeldatasets3reference, 'csvfile')
                            .loadCsvFile('csvfile', 'mergedataset')
                            .renameColumns('mergedataset', step.renamedcolumns.map(function(column){
                                return '"' + column.replace(/"/g, '\\"') + '"';
                            }).join(','));

                        if (step.dropcolumns && step.dropcolumns.length > 0){
                            generator.dropColumns('mergedataset', step.dropcolumns.map(function(column){
                                return column;
                            }).join(','));
                        }

                        generator.mergeDataset('dataset', step.destinationkeyfieldindex, 'mergedataset', step.keyfieldindex);
                    }
                }
            });
        }
    });

    if (!generator.transformedDataset){
        generator
            .saveCSVToS3File('dataset', outputFileKey, 'csv', 'datasetstl', 'savedfile', req.body.processData.hasheader);
    }

    //generator.predict('test12345/158bebed76e.rdata');

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

};
