'use strict';

angular.module('process')
    .factory('Deployr', ['$q', '$http', function($q, $http) {
      return {
        run: function(tasks, processData) {
          var dfd = $q.defer();

          $http.post('/api/deployr/run', {
            tasks : tasks,
            processData : processData
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
