'use strict';

//users List Controller
angular.module('users')
    .controller('CreditCardModalController', ['$scope', '$uibModalInstance', 'BillingService', 'toastr', 'next','initObj',
    function($scope, $uibModalInstance, BillingService, toastr, next, initObj){
      $scope.initObj = initObj;
      $scope.billing = initObj.billing;
      if(initObj.billing){
        $scope.showCardForm = false;
      } else{
        $scope.showCardForm = true;
      }

      $scope.changeCard = function(val){
        $scope.showCardForm = val;
      };

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

      $scope.confirm = function(){
        $scope.submitting = true;
        next();
      };
    }]);
