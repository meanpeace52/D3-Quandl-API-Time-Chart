'use strict';

angular.module('users').controller('BillingController', ['$scope', 'Authentication','$http' ,'$window' ,
  function ($scope, Authentication, $http, $window) {
    $scope.user = Authentication.user;
    $http({
      method: 'GET',
      url: '/api/users/billing'
    }).then(function successCallback(response) {

        $scope.billing = response.data;
    }, function errorCallback(response) {
        $scope.error = 'something went wrong';
    });
  }
]);
