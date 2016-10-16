'use strict';

//users List Controller
angular.module('users')
    .controller('SubscribeModalController', ['$scope', '$uibModalInstance', 'BillingService', 'toastr', 'plans', 'plan_id', 'next',
    function($scope, $uibModalInstance, BillingService, toastr, plans, plan_id, next){
      $scope.plans = plans;
      $scope.cancel = function(){
        $uibModalInstance.close();
      };
      $scope.planOptions = [{id:'premium',name:'Premium'},{id:'small_business',name:'Small Business'},{id:'enterprise',name:'Enterprise'}];
      $scope.periodOptions = [{val:12,name:'Yearly'},{val:6,name:'6 Months'},{val:1,name:'Monthly'}];
      for (var i = 0; i < $scope.planOptions.length; i++) {
        if($scope.planOptions[i].id == plan_id) $scope.selectedPlan = $scope.planOptions[i];
      }
      $scope.selectedPeriod = $scope.periodOptions[0];
      $scope.getPrice = function (data){
        if(data.id) $scope.selectedPlan = data;
        if(data.val) $scope.selectedPeriod = data;
        if($scope.plans){
          for (var i = 0; i < $scope.plans.length; i++) {
            var p = $scope.plans[i];
            if(p.id == $scope.selectedPlan.id && p.period == $scope.selectedPeriod.val){
              $scope.price = p.price;
              $scope.stripe_plan_id = p.stripe_id;
            }
          }
        }
      };
      $scope.validate = function(form){
        if (!form.$valid){
          $scope.submitted = true;
          toastr.error('Please fix the errors before you can continue.');
          $scope.$broadcast('show-errors-check-validity', 'form');
        }
      };
      $scope.getPrice($scope.selectedPeriod);
      $scope.stripeCallback = function (code, result) {
        if (result.error) {
            $scope.carderror = result.error.message;
        } else {
          BillingService.subscribe(result.id, $scope.stripe_plan_id, function successCallback(response) {
            next();
          });
          $uibModalInstance.close();
        }
      };
    }]);
