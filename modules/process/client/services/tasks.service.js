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
          title: 'Merge',
          slug: 'merge',
          script: {
            type: SCRIPT_TYPE.EXTERNAL,
            path: '' //s3 link
          },
          returnType: SCRIPT_RETURN_TYPE.DATASET,
          options: {
            dataset1: 'default value',
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
          slug: 'standardize-dates'
        }, {
          title: 'Sub-sample (rows)',
          slug: 'subsample'
        }, {
          title: 'Missing data imputation',
          slug: 'missing-data-imputation'
        }, {
          title: 'Convert factors',
          slug: 'convert-factors'
        }]
      }, {
        title: 'Exploratory',
        subtasks: [{
          title: 'PCA',
          slug: 'pca'
        }, {
          title: 'K-means',
          slug: 'kmeans'
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
