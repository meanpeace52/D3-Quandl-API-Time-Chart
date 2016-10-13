'use strict';

// Billing service used for communicating with the users billing REST endpoint
angular.module('users').factory('BillingService', ['$http', '$window',
  function ($http, $window) {
    $window.Stripe.setPublishableKey($window.stripe_pub_key);
    var billing = {};

    billing.getPlans = function(){
      return $http.get('/api/users/plans');
    };

    billing.getSubscription = function(){
      return $http.get('/api/users/mysubscription');
    };

    billing.subscribe = function(token, plan_id){
      return $http.post('/api/users/subscribe', { plan: plan_id , token: token});
    };

    billing.updateCard = function(token){
      return $http.put('/api/users/billing', { token: token});
    };

    billing.getInvoices = function(){
      return $http.get('/api/users/invoices');
    };

    billing.getBillingInfo = function(){
      return $http.get('/api/users/billing');
    };

    return billing;
  }
]);
