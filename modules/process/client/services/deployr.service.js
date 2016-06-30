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
            filename: task.script.filename,
            directory: task.script.directory,
            author: 'testuser',
            rinputs: task.script.rInputsFn(dataset.columns, dataset.rows, task.options),
            routputs: task.script.routputs
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
