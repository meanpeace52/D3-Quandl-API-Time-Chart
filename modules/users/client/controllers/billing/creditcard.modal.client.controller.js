'use strict';

//users List Controller
angular.module('users')
    .controller('CreditCardModalController', ['$scope', '$uibModalInstance', 'BillingService', 'toastr', 'next','title',
    function($scope, $uibModalInstance, BillingService, toastr, next, title){
      $scope.title = title;
      $scope.cancel = function(){
        $uibModalInstance.close();
      };

      $scope.onError = function(err){
        $scope.submitting = false;
        $scope.carderror = err.data.message;
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
          $scope.submitting = true;
          next(result);
        }
      };
    }]);
