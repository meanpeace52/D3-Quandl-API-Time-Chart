'use strict';

// Billing service used for communicating with the users billing REST endpoint and opening modals
angular.module('users').factory('BillingService', ['$http', '$window','toastr', '$uibModal', 'Authentication',
  function ($http, $window, toastr, $uibModal, Authentication) {
    $window.Stripe.setPublishableKey($window.stripe_pub_key);
    var billing = {};
    var plans;

    billing.getPlans = function(next){
      if(!plans){
        $http.get('/api/users/plans').then(function successCallback(response) {
            plans = response.data;
            next(plans);
        }, function errorCallback(response) {
          toastr.error('Could not load plans');
        });
      }else{
        next(plans);
      }
    };

    billing.getSubscription = function(next){
      if(Authentication.user){
        return $http.get('/api/users/mysubscription').then(function successCallback(response) {
            next(response.data);
        }, function errorCallback(response) {
          toastr.error('Could not load your subscription');
        });
      } else {
        toastr.error('You need to be logged in');
      }
    };

    billing.subscribe = function(token, plan_id, next){
      if(Authentication.user){
        return $http.post('/api/users/subscribe', { plan: plan_id , token: token}).then(function successCallback(response) {
          toastr.success('Your subscription has been successfully updated');
          Authentication.user.plan = response.data;
          next(response.data);
        }, function errorCallback(response) {
          toastr.error('Could not update your subscription');
        });
      } else {
        toastr.error('You need to be logged in');
      }
    };

    billing.updateCard = function(token, next){
      if(Authentication.user){
        return $http.put('/api/users/billing', { token: token}).then(function successCallback(response) {
          toastr.success('Your credit card has been successfully updated');
          next(response.data);
        }, function errorCallback(response) {
          toastr.error('Could not update your credit card');
        });
      } else {
        toastr.error('You need to be logged in');
      }
    };

    billing.getInvoices = function(next){
      if(Authentication.user){
        return $http.get('/api/users/invoices').then(function successCallback(response) {
          next(response.data);
        }, function errorCallback(response) {
          toastr.error('Could not get your invoices');
        });
      } else {
        toastr.error('You need to be logged in');
      }
    };

    billing.getBillingInfo = function(next){
      if(Authentication.user){
        return $http.get('/api/users/billing').then(function successCallback(response) {
          next(response.data);
        }, function errorCallback(response) {
          toastr.error('Could not get your billing information');
        });
      } else {
        toastr.error('You need to be logged in');
      }
    };

    billing.createAccount = function(data, next){
      if(Authentication.user){
        return $http.post('/api/users/account', data).then(function successCallback(response) {
          next(response.data);
        }, function errorCallback(response) {
          toastr.error('Could not create your account');
        });
      } else {
        toastr.error('You need to be logged in');
      }
    };

    billing.openSelectPlanModal = function(options, next){
      this.getPlans(function(plans){
        var modalInstance = $uibModal.open({
          templateUrl: 'modules/users/client/views/billing/subscribe.modal.client.html',
          controller: 'SubscribeModalController',
          resolve: {
            plans: function() {return plans;},
            options: function() {return options;},
            next: function() {return next;},
          }
        });
      });
    };

    billing.openCreditCardModal = function(next){
        var modalInstance = $uibModal.open({
          templateUrl: 'modules/users/client/views/billing/creditcard.modal.client.html',
          controller: 'CreditCardModalController',
          resolve: {
            next: function() {return next;},
          }
        });
    };

    return billing;
  }
]);
