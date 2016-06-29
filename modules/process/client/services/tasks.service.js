'use strict';

angular.module('process')
    .factory('Tasks', [function() {

      var SCRIPT_TYPE = {
        DEPLOYR: 'deployr',
        CODE: 'code',
        EXTERNAL: 'external'
      };

      var SCRIPT_RETURN_TYPE = {
        DATASET: 'dataset',
        MODEL: 'model'
      };

      var dataFrameInput = function(name, columns, rows) {
        return [rbroker.RInput.dataframe(name, columns.map(function(column) {
          return rbroker.RInput.characterVector(column, rows.map(function(row) {
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
        title: 'Summaries',
        subtasks: []
      }, {
        title: 'Join',
        subtasks: [{
          title: 'Merge (Drag me)',
          slug: 'merge',
          script: {
            type: SCRIPT_TYPE.EXTERNAL,
            path: '' //s3 link
          },
          returnType: SCRIPT_RETURN_TYPE.DATASET,
          options: {
            dataset1: '',
            dataset2: '',
            dataset1Key: '',
            dataset2Key: '',
            mergeType: ''
          }
        }]
      }, {
        title: 'Transforms',
        subtasks: [{
          title: 'Standardize dates',
          returnType: SCRIPT_RETURN_TYPE.DATASET,
        }, {
          title: 'Sub-sample (rows)',
          returnType: SCRIPT_RETURN_TYPE.DATASET,
        }, {
          title: 'Missing data imputation',
          returnType: SCRIPT_RETURN_TYPE.DATASET,
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
        subtasks: [{
          title: 'PCA',
          returnType: SCRIPT_RETURN_TYPE.DATASET,
        }, {
          title: 'K-means',
          returnType: SCRIPT_RETURN_TYPE.DATASET,
        }]
      }, {
        title: 'Econometric',
        subtasks: []
      }, {
        title: 'MODEL IT!',
        subtasks: [{
          title: 'Linear Regression',
          returnType: SCRIPT_RETURN_TYPE.MODEL,
          script: {
            type: SCRIPT_TYPE.DEPLOYR,
            directory: 'root',
            filename: 'LRtest6.R',
            // TODO: what if the selected dataset has null values
            rInputsFn: dataFrameInput.bind(null, 'dataset'),
            routputs: ['coefficients', 'interceptSE', 'x', 'xSE']
          }
        }]
      }];

      var taskOptions = [];

      return {
        SCRIPT_TYPE: SCRIPT_TYPE,
        SCRIPT_RETURN_TYPE: SCRIPT_RETURN_TYPE,
        getTasks: function() {
          return tasks;
        },
        getSubtaskByTitle: function(title) {
          return _.compact(tasks.map(function(task) {
            return _.find(task.subtasks, {title: title});
          }))[0];
        }
      };
    }]);
