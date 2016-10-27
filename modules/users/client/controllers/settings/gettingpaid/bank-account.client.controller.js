'use strict';

angular.module('users').controller('BankAccountController', ['$scope','Authentication','BillingService','toastr',
  function ($scope, Authentication, BillingService, toastr) {

    $scope.validate = function(form){
      if (!form.$valid){
        $scope.submitted = true;
        toastr.error('Please fix the errors before you can continue.');
        $scope.$broadcast('show-errors-check-validity', 'form');
      } else {
        $scope.accountLoaded = false;
        BillingService.updateBankAccount({
          external_account:{
            routing_number:$scope.external_account.routing_number,
            account_number:$scope.external_account.account_number,
          }
        },
          function (err, account) {
            if(!err){
              $scope.accountUpdated = true;
              $scope.external_account = account;
            }
            $scope.accountLoaded = true;
        });
      }
    };

    BillingService.getAccount(function (err, account) {
      initAccountInfo(account);
    });


    function initAccountInfo(account){
      if(account.id) {
        if(account.external_accounts.data.length) {
          $scope.external_account = account.external_accounts.data[0];
        }
        $scope.accountLoaded = true;
      }
    }
  }
]);
