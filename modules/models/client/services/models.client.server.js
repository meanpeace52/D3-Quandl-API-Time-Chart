'use strict';

angular.module('models')
  .factory('Models', ['$http', function ($http) {
    return {
      filter: function (field, value) {
        return $http.get('api/models/' + field + '/' + value);
      }
    };
    }]);
