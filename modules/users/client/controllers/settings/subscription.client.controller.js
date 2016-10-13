'use strict';

angular.module('users').controller('MySubscriptionController', ['$scope', 'Authentication','BillingService' ,'$window' ,
  function ($scope, Authentication, BillingService, $window) {
    $scope.user = Authentication.user;
    $window.Stripe.setPublishableKey($window.stripe_pub_key);
    $scope.showform = true;

    BillingService.getPlans().then(function successCallback(response) {
        $scope.plans = response.data;
        for (var i = 0; i < $scope.plans.length; i++) {
          if(Authentication.user.plan == $scope.plans[i].id) $scope.selected_plan = $scope.plans[i];
          break;
        }
        if(!$scope.selected_plan) $scope.selected_plan = $scope.plans[0];
    }, function errorCallback(response) {

    });

    function getSubscription(){
      BillingService.getSubscription().then(function successCallback(response) {
        if(response.data.plan) {
          $scope.mySubscription = response.data;
        }else {
          $scope.mySubscription = {free:true};
        }
      }, function errorCallback(response) {

      });
    }

    getSubscription();

    $scope.selectNewSubscription = function(){
      $scope.askforcc = true;
      $scope.showform = false;
    };

    $scope.stripeCallback = function (code, result) {
        if (result.error) {
            $scope.carderror = result.error.message;
        } else {
          $scope.submitting = 'Submitting Payment information';
          $scope.askforcc = false;
          BillingService.subscribe(result.id, $scope.selected_plan.id).then(function successCallback(response) {
              $scope.confirmation = 'Awesome you successfully subscribed to a new plan : ' + $scope.selected_plan.name;
              $scope.getSubscription();
              $scope.user.plan = $scope.selected_plan.id;
              $scope.submitting = null;
          }, function errorCallback(response) {
              $scope.carderror = 'sorry your card was declined';
              $scope.submitting = null;
              $scope.askforcc = true;
          });
        }
    };
  }
]);
