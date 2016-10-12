'use strict';

angular.module('users').controller('InvoicesController', ['$scope', 'Authentication','$http' ,'$window' ,
  function ($scope, Authentication, $http, $window) {
    $scope.user = Authentication.user;
    $http({
      method: 'GET',
      url: '/api/users/invoices'
    }).then(function successCallback(response) {
        $scope.invoices = response.data;
    }, function errorCallback(response) {
        $scope.error = 'something went wrong';
    });
  }
]);
