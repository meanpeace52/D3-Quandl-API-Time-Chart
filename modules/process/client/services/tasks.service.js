'use strict';

angular.module('process')
    .factory('Tasks', [function() {

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
        getTasks: function() {
          return tasks;
        }
      };
    }]);
