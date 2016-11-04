'use strict';

angular.module('process')
    .factory('ProcessStateService', ['$http', function($http) {
      var stateHistory = [];

      return {
        changeState: function(state){
          stateHistory.push(state);
          console.log(stateHistory);
        },
        previouseState: function(){
          stateHistory.pop();
          console.log(stateHistory);
          return stateHistory[stateHistory.length - 1];
        },
        setState: function(state){
          stateHistory = state;
        }
      };
    }]);
