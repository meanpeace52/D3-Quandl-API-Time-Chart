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
        loadProcessData: function(){
          if ($localStorage.processData){
            processData = $localStorage.processData;
          }
          else{
            processData = {};
          }
        },
        saveProcessData: function(){
          $localStorage.processData = processData;
        },
        currentProcessData: function(){
          return processData;
        },
        loadTransformSteps: function(){
          if ($localStorage.transformSteps){
            transformSteps = $localStorage.transformSteps;
          }
          else{
            transformSteps = [];
          }
        },
        saveTransformSteps: function(transformSteps){
          $localStorage.transformSteps = transformSteps;
          transformSteps = transformSteps;
        },
        currentTransformSteps: function(){
          return transformSteps;
        },
        loadProcessTasksData: function(){
          if ($localStorage.processTasksData){
            processTasksData = $localStorage.processTasksData;
          }
          else{
            processTasksData = {
              title : '',
              tasks : []
            };
          }
        },
        saveProcessTasksData: function(processTasksData){
          $localStorage.processTasksData = processTasksData;
          processTasksData = processTasksData;
        },
        currentProcessTasksData: function(){
          return processTasksData;
        },
        loadState: function(){
          if ($localStorage.stateHistory){
            stateHistory = $localStorage.stateHistory;
          }
          else{
            stateHistory = [];
          }
        },
        changeState: function(state){
          stateHistory.push(state);
          $localStorage.stateHistory = stateHistory;
        },
        previouseState: function(){
          stateHistory.pop();
          $localStorage.stateHistory = stateHistory;
          return stateHistory[stateHistory.length - 1];
        },
        setState: function(state){
          stateHistory = state;
          $localStorage.stateHistory = stateHistory;
        }
      };
    }]);
