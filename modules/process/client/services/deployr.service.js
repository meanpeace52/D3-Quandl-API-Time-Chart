'use strict';

angular.module('process')
    .factory('Deployr', ['$q', '$http', function($q, $http) {
      return {
        run: function(inputFile, task) {
          var dfd = $q.defer();

          $http.post('/api/deployr/run', {
            filename: task.script.filename,
            rinputs: task.script.rInputsFn(inputFile, task.options),
            routputs: task.script.routputs
          })
              .success(function (data, status, headers, config) {
                dfd.resolve(data);
              })
              .error(function (data, status, headers, config) {
                dfd.reject(data);
              });

          return dfd.promise;
        },
        runExternal: function(task) {

        },
        runCode: function(task) {

        }
      };
    }]);
