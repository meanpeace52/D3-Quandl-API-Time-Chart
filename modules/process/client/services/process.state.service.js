'use strict';

angular.module('process')
    .factory('ProcessStateService', ['$http', '$localStorage', function($http, $localStorage) {
      var stateHistory = [];
      var processData = {};
      var transformSteps = [];
      var processTasksData = [];

      return {
        setSelectedDataset: function(dataset){
          $localStorage.selectedDataset = dataset;
        },
        getSelectedDataset: function(){
          if ($localStorage.selectedDataset){
            return $localStorage.selectedDataset;
          }
          else{
            return {};
          }
        },
        saveProcessData: function(data){
          $localStorage.processData = data;
        },
        currentProcessData: function(){
          if ($localStorage.processData){
            return $localStorage.processData;
          }
          else{
            return {};
          }
        },
        saveTransformSteps: function(transformSteps){
          $localStorage.transformSteps = transformSteps;
        },
        currentTransformSteps: function(){
          if ($localStorage.transformSteps){
            return $localStorage.transformSteps;
          }
          else{
            return [];
          }
        },
        saveProcessTasksData: function(processTasksData){
          $localStorage.processTasksData = processTasksData;
        },
        currentProcessTasksData: function(){
          if ($localStorage.processTasksData){
            return $localStorage.processTasksData;
          }
          else{
            return {
              title : '',
              tasks : []
            };
          }
        },
        getStateHistory: function(){
          if ($localStorage.stateHistory){
            return $localStorage.stateHistory;
          }
          else{
            return [];
          }
        },
        changeState: function(state){
          $localStorage.stateHistory.push(state);
        },
        previousState: function(){
          stateHistory = $localStorage.stateHistory;
          stateHistory.pop();
          $localStorage.stateHistory = stateHistory;
          return stateHistory[stateHistory.length - 1];
        },
        setState: function(state){
          if (!$localStorage.stateHistory){
            $localStorage.stateHistory = [];
          }
          $localStorage.stateHistory.push(state);

        }
      };
    }]);
