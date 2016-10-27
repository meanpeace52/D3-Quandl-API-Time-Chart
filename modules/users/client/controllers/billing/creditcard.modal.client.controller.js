'use strict';

//users List Controller
angular.module('users')
    .controller('CreditCardModalController', ['$scope', '$uibModalInstance', 'BillingService', 'toastr', 'next',
    function($scope, $uibModalInstance, BillingService, toastr, next){
      $scope.cancel = function(){
        $uibModalInstance.close();
      };
      $scope.validate = function(form){
        if (!form.$valid){
          $scope.submitted = true;
          toastr.error('Please fix the errors before you can continue.');
          $scope.$broadcast('show-errors-check-validity', 'form');
        }
      };
      $scope.stripeCallback = function (code, result) {
        if (result.error) {
            $scope.carderror = result.error.message;
        } else {
          next(result);
          $uibModalInstance.close();
        }
      };
    }]);
