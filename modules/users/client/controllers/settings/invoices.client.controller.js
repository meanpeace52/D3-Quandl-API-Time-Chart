'use strict';

angular.module('users').controller('InvoicesController', ['$scope', 'Authentication','BillingService' ,'$window' ,
  function ($scope, Authentication, BillingService, $window) {
    $scope.user = Authentication.user;
    BillingService.getInvoices().then(function successCallback(response) {
        $scope.invoices = response.data;
    }, function errorCallback(response) {
        $scope.error = 'something went wrong';
    });
  }
]);
