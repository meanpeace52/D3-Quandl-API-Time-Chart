'use strict';

angular.module('models')
  .factory('Models', ['$http', function ($http, $resource) {
    return {
      
      filter: function (field, value) {
        return $http({
            url: 'api/models/' + field + '/' + value,
            method: 'GET'
          });
      }
    };
    }]);
