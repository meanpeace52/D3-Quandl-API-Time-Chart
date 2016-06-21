'use strict';

angular.module('process')
    .factory('Process', [function() {
      var currentProcess = null;

      return {
        setSelectedProcess: function(process) {
          currentProcess = process;
        },
        getSelectedProcess: function() {
          return currentProcess;
        },
        getProcesses: function() {
          // TODO: api call
        },
        saveSelectedProces: function() {
          // TODO: api call
        }
      };
    }]);
