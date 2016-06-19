'use strict';

angular.module('process')
    .factory('Process', [function() {
      var currentProcess = null;
      var selectedDataset = null;

      return {
        setSelectedDataset: function(dataset) {
          selectedDataset = dataset;
        },
        getSelectedDataset: function() {
          return selectedDataset;
        },
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
