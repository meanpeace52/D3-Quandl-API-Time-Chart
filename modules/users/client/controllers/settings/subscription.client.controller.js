'use strict';

angular.module('users').controller('MySubscriptionController', ['$scope', 'Authentication','$http' ,'$window' ,
  function ($scope, Authentication, $http, $window) {
    $scope.user = Authentication.user;
    $window.Stripe.setPublishableKey($window.stripe_pub_key);
    $scope.showform = true;

    $http({
      method: 'GET',
      url: '/api/users/plans'
    }).then(function successCallback(response) {
        $scope.plans = response.data;
        for (var i = 0; i < $scope.plans.length; i++) {
          if(Authentication.user.plan == $scope.plans[i].id) $scope.selected_plan = $scope.plans[i];
          break;
        }
        if(!$scope.selected_plan) $scope.selected_plan = $scope.plans[0];
    }, function errorCallback(response) {

    });

    $scope.getSubscription = function (){
      $http({
        method: 'GET',
        url: '/api/users/mysubscription'
      }).then(function successCallback(response) {
          if(response.data.plan) {
            $scope.mySubscription = response.data;
          }else {
            $scope.mySubscription = {free:true};
          }
      }, function errorCallback(response) {

      });
    };
    $scope.getSubscription();

    $scope.selectNewSubscription = function(){
      $scope.askforcc = true;
      $scope.showform = false;
    };

    $scope.stripeCallback = function (code, result) {
        if (result.error) {
            $scope.carderror = result.error;
        } else {
          $scope.submitting = 'Submitting Payment information';
          $scope.askforcc = false;
          $http({
            method: 'POST',
            url: '/api/users/subscribe',
            data: { plan: $scope.selected_plan , token: result.id}
          }).then(function successCallback(response) {
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
