'use strict';

angular.module('process')
    .factory('Deployr', ['$q', function($q) {

      var dBroker = rbroker.discreteTaskBroker({
        host: 'http://52.73.208.190:7400',
        cors: true,
        maxConcurrentTaskLimit: 1,
        credentials: {
          username: 'testuser',
          password: 'cFYmFTBcwAPNPxCVvmas5W2b'
        }
      });

      return {
        run: function(dataset, task) {
          var deferred = $q.defer();
          dBroker.submit(rbroker.discreteTask({
            filename: task.filename,
            directory: task.directory,
            author: 'testuser',
            rinputs: task.rInputsFn(dataset.columns, dataset.rows),
            routputs: task.routputs
          })).promise().then(function(res) {
            deferred.resolve(res.result.generatedObjects);
          });
          return deferred.promise;
        },
        runExternal: function(task) {

        },
        runCode: function(task) {

        }
      };
    }]);
