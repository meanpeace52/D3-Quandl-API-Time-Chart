'use strict';

angular.module('models')
    .factory('Models', ['$http', function($http) {
      return {
        getByUser: function(userId) {
          return $http({
            url: 'api/models/user/' + userId,
            method: 'GET'
          })
          .then(function(res) {
            return res.data;
          }, function(err) {
            console.error(err);
          });
        },
        create: function(model) {
          return $http({
            url: 'api/models',
            method: 'POST',
            data: {
              model: model
            }
          })
          .then(function(res) {
            return res.data;
          });
        }
      };
    }]);
