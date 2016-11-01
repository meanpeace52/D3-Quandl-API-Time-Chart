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
        $http.get('/api/users/mysubscription').then(function successCallback(response) {
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
        $http.post('/api/users/subscribe', { plan: plan_id , token: token}).then(function successCallback(response) {
          toastr.success('Your subscription has been successfully updated');
          Authentication.user.plan = response.data;
          next(null, response.data);
        }, function (err) {
          next(err);
          toastr.error('Could not update your subscription.\n'+err.data.message);
        });
      } else {
        toastr.error('You need to be logged in');
      }
    };

    billing.updateCard = function(token, next){
      if(Authentication.user){
        $http.put('/api/users/billing', { token: token}).then(function (response) {
          toastr.success('Your credit card has been successfully updated');
          next(null, response.data);
        }, function (err) {
          toastr.error('Could not update your credit card.\n'+err.data.message);
          next(err);
        });
      } else {
        toastr.error('You need to be logged in');
      }
    };

    billing.getInvoices = function(next){
      if(Authentication.user){
        $http.get('/api/users/invoices').then(function (response) {
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
        $http.get('/api/users/billing').then(function (response) {
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
        $http.post('/api/users/account', data).then(function (response) {
          next(null,response.data);
        }, function (err) {
          next(err);
          toastr.error('Could not create your account.\n'+err.data.message);
        });
      } else {
        toastr.error('You need to be logged in');
      }
    };

    billing.updateBankAccount = function(data, next){
      if(Authentication.user){
        $http.post('/api/users/account/bank', data).then(function (response) {
          next(null,response.data);
        }, function (err) {
          next(err);
          toastr.error('Could not update your bank account.\n'+err.data.message);
        });
      } else {
        toastr.error('You need to be logged in');
      }
    };


    billing.updateAccount = function(data, next){
      if(Authentication.user){
        $http.put('/api/users/account', data).then(function successCallback(response) {
          next(null, response.data);
        }, function errorCallback(err) {
          next(err);
          toastr.error('Could not update your account.\n'+err.data.message);
        });
      } else {
        toastr.error('You need to be logged in');
      }
    };


    billing.getAccount = function(next){
      if(Authentication.user){
        $http.get('/api/users/account').then(function successCallback(response) {
          next(null, response.data);
        }, function errorCallback(err) {
          next(err);
          toastr.error('Could not get your account');
        });
      } else {
        toastr.error('You need to be logged in');
      }
    };


    billing.openSelectPlanModal = function(options, next){
      billing.getBillingInfo(function(billingInfo){
        billing.getPlans(function(plans){
          var modalInstance = $uibModal.open({
            templateUrl: 'modules/users/client/views/billing/subscribe.modal.client.view.html',
            controller: 'SubscribeModalController',
            resolve: {
              plans: function() {return plans;},
              options: function() {return options;},
              next: function() {return next;},
              billingInfo: function() {return billingInfo;}
            }
          });
        });
      });
    };

    billing.testCharge = function(token, next){
      if(Authentication.user){
        $http.post('/api/users/testcharge', { token: token}).then(function (response) {
          toastr.success('The charge has succeeded');
          next(null, response.data);
        }, function (err) {
          toastr.error('Could not create charge.\n'+err.data.message);
          next(err, null);
        });
      } else {
        toastr.error('You need to be logged in');
      }
    };

    billing.purchase = function(token, type, id, next){
      if(Authentication.user){
        $http.post('/api/users/purchase', { token: token, type: type, id: id}).then(function (response) {
          toastr.success('Your item has been purchased');
          next(null, response.data);
        }, function (err) {
          toastr.error('Could not purchase item.\n'+err.data.message);
          next(err, null);
        });
      } else {
        toastr.error('You need to be logged in');
      }
    };

    billing.openChangeCreditCardModal = function(next){
      var modalInstance = billing.openCreditCardModal(
        {
          title:'Update your Credit Card',
          description:'Enter your new credit card info',
          billing:null
        },
        function(result){
          billing.updateCard(result.id, function (err, response) {
            if(err){
              modalInstance.close();
              billing.openChangeCreditCardModal(next);
            }else{
              modalInstance.close();
              next(response);
            }
        });
      });
    };

    billing.openCheckoutModal = function(initObj, next){
      billing.getBillingInfo(function(billingInfo){
        initObj.billing = billingInfo;
        var modalInstance = billing.openCreditCardModal(
          initObj,
          function(result){
            billing.purchase(result ? result.id : null, initObj.type, initObj.id,function (err, response) {
              if(err){
                modalInstance.close();
                billing.openCheckoutModal(initObj, next);
              }else{
                modalInstance.close();
                next(response);
              }
          });
        });
      });
    };

    billing.openTestChargeModal = function(next){
      billing.getBillingInfo(function(billingInfo){
        var modalInstance = billing.openCreditCardModal(
          {
            title:'Create a test charge on connected account',
            description:'Test your managed account',
            billing:billingInfo
          },
          function(result){
            billing.testCharge(result ? result.id : null, function (err, response) {
              if(err){
                modalInstance.close();
                billing.openTestChargeModal(next);
              }else{
                modalInstance.close();
                next(response);
              }
          });
        });
      });
    };


    billing.openCreditCardModal = function(initObj, next){
      return $uibModal.open({
        templateUrl: 'modules/users/client/views/billing/creditcard.modal.client.view.html',
        controller: 'CreditCardModalController',
        resolve: {
          next: function() {
            return function(result){
              next(result);
            };
          },
          initObj: function() {return initObj;}
        }
      });
    };


    return billing;
  }
]);
