'use strict';

angular.module('process')
    .factory('Tasks', [function () {

        var SCRIPT_TYPE = {
            DEPLOYR: 'deployr',
            CODE: 'code',
            EXTERNAL: 'external'
        };

        var SCRIPT_RETURN_TYPE = {
            DATASET: 'dataset',
            MODEL: 'model'
        };

        var dataFrameInput = function (name, columns, rows) {
            // filter out empty rows
            rows = rows.filter(function (row) {
                return _.every(columns.map(function (column) {
                    return row[column];
                }));
            });
            return [rbroker.RInput.dataframe(name, columns.map(function (column) {
                return rbroker.RInput.characterVector(column, rows.map(function (row) {
                    return row[column].toString();
                }));
            }))];
        };

        /*
         * If a task is supposed to render any options when
         * selected, a route with name `lab.process.taskoptions.${slug}`
         * must be registered.
         */
        var tasks = [{
            title: 'Initial Transformations',
            hideinlist: true,
            subtasks: [{
                title: 'Initial Transformations',
                returnType: SCRIPT_RETURN_TYPE.DATASET,
                options: {
                    transformationSteps: []
                }
            }]
        },
            {
                title: 'Load Existing Model',
                hideinlist: true,
                subtasks: [{
                    title: 'Load Existing Model',
                    returnType: SCRIPT_RETURN_TYPE.MODEL,
                    options: {}
                }]
            }, {
                title: 'Summaries',
                color: 'blue',
                subtasks: []
            }, {
                title: 'Transforms',
                color: 'yellow',
                subtasks: [{
                    title: 'Standardize dates',
                    returnType: SCRIPT_RETURN_TYPE.DATASET,
                }, {
                    title: 'Sub-sample (rows)',
                    returnType: SCRIPT_RETURN_TYPE.DATASET,
                }, {
                    title: 'Missing data imputation',
                    returnType: SCRIPT_RETURN_TYPE.DATASET,
                    validate: function () {
                        return true;
                    },
                    script: {
                        type: SCRIPT_TYPE.DEPLOYR,
                        directory: 'root',
                        filename: 'LRtest.R',
                        rInputsFn: dataFrameInput.bind(null, 'datasetwithNA'),
                        routputs: ['dataset']
                    }
                }, {
                    title: 'Convert factors',
                    returnType: SCRIPT_RETURN_TYPE.DATASET,
                }]
            }, {
                title: 'Exploratory',
                color: 'pink',
                subtasks: [{
                    title: 'PCA',
                    returnType: SCRIPT_RETURN_TYPE.DATASET,
                }, {
                    title: 'K-means',
                    returnType: SCRIPT_RETURN_TYPE.DATASET,
                }]
            }, {
                title: 'Econometric',
                color: 'orange',
                subtasks: []
            }, {
                title: 'MODEL IT!',
                subtasks: [{
                    title: 'Linear Regression',
                    slug: 'linearregression',
                    returnType: SCRIPT_RETURN_TYPE.MODEL,
                    options: {
                        yColIndex: '',
                        removeNA: false,
                        train: 0.01
                    },
                    validate: function (options) {
                        return !isNaN(parseInt(options.yColIndex));
                    }
                }]
            }, {
                title: 'Prediction',
                subtasks: [{
                    title: 'Predict',
                    slug: 'predict',
                    returnType: SCRIPT_RETURN_TYPE.DATASET,
                    options: {
                        selectedModel: -1
                    },
                    validate: function (options) {
                        return options.selectedModel !== '';
                    }
                }]
            }];

        var taskOptions = [];

        return {
            SCRIPT_TYPE: SCRIPT_TYPE,
            SCRIPT_RETURN_TYPE: SCRIPT_RETURN_TYPE,
            getTasks: function () {
                return tasks;
            },
            getSubtaskByTitle: function (title) {
                return _.compact(tasks.map(function (task) {
                    return _.find(task.subtasks, {title: title});
                }))[0];
            }
        };
    }]);
