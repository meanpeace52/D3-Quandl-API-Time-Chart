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
        }, {
          title: 'Convert factors',
          returnType: SCRIPT_RETURN_TYPE.DATASET,
        }]
      }, {
        title: 'Exploratory',
        subtasks: [{
          title: 'PCA',
          returnType: SCRIPT_RETURN_TYPE.MODEL,
        }, {
          title: 'K-means',
          returnType: SCRIPT_RETURN_TYPE.MODEL,
        }]
      }, {
        title: 'Econometric',
        subtasks: []
      }];

      var taskOptions = [];

      return {
        SCRIPT_TYPE: SCRIPT_TYPE,
        SCRIPT_RETURN_TYPE: SCRIPT_RETURN_TYPE,
        getTasks: function() {
          return tasks;
        }
      };
    }]);
