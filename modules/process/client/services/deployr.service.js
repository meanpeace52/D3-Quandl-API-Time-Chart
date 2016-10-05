'use strict';

angular.module('process')
    .factory('Deployr', ['$q', '$http', function($q, $http) {


      return {
        run: function(dataset, task) {
          var dfd = $q.defer();

          $http.post('/api/deployr/run', {
            filename: task.script.filename,
            rinputs: task.script.rInputsFn(dataset.columns, dataset.rows, task.options),
            routputs: task.script.routputs
          })
              .success(function (data, status, headers, config) {
                dfd.resolve(data);
              })
              .error(function (data, status, headers, config) {
                dfd.reject(data);
              });

          return dfd.promise;

          return dBroker.submit(rbroker.discreteTask({
            filename: task.script.filename,
            directory: task.script.directory,
            author: 'testuser',
            rinputs: task.script.rInputsFn(dataset.columns, dataset.rows, task.options),
            routputs: task.script.routputs
          }));
        },
        runExternal: function(task) {

        },
        runCode: function(task) {

        }
      };
    }]);
