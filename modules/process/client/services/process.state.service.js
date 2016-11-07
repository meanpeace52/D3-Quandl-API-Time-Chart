'use strict';

angular.module('process')
    .factory('ProcessStateService', ['$http', '$localStorage', function($http, $localStorage) {
      var stateHistory = [];
      var processData = {};

      return {
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
