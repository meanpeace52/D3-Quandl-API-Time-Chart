'use strict';

//users List Controller
angular.module('users')
    .controller('SubscribeModalController', ['$scope', '$uibModalInstance', 'BillingService', 'toastr', 'plans', 'options' , 'billingInfo', 'next',
    function($scope, $uibModalInstance, BillingService, toastr, plans, options, billingInfo, next){
      $scope.plans = plans;
      $scope.billing = billingInfo;
      if(billingInfo){
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
      $scope.planOptions = [{id:'premium',name:'Premium'},{id:'small_business',name:'Small Business'},{id:'enterprise',name:'Enterprise'}];
      $scope.periodOptions = [{val:12,name:'Yearly',period:'Year'},{val:6,name:'6 Months',period:'6 Months'},{val:1,name:'Monthly',period:'Month'}];
      for (var i = 0; i < $scope.planOptions.length; i++) {
        if($scope.planOptions[i].id == options.plan_id) $scope.selectedPlan = $scope.planOptions[i];
      }
      if(!$scope.selectedPlan) $scope.selectedPlan = $scope.planOptions[0];


      for (i = 0; i < $scope.periodOptions.length; i++) {
        if($scope.periodOptions[i].val == options.period) $scope.selectedPeriod = $scope.periodOptions[i];
      }
      if(!$scope.selectedPeriod) $scope.selectedPeriod = $scope.periodOptions[0];


      $scope.allow_choice = options.allow_choice;
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
          $scope.submitting = true;
          BillingService.subscribe(result.id, $scope.stripe_plan_id, function (err, response) {
            if(err){
              $scope.carderror = err.data.message;
              $scope.submitting = false;
            }else{
              $uibModalInstance.close();
              next();
            }
          });
        }
      };

      $scope.confirm = function(){
        BillingService.subscribe(null, $scope.stripe_plan_id, function (err, response) {
          if(err){
            $scope.carderror = err.data.message;
            $scope.submitting = false;
          }else{
            $uibModalInstance.close();
            next();
          }
        });
      };
    }]);
