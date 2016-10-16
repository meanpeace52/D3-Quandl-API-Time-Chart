'use strict';

angular.module('users').controller('BillingController', ['$scope','Authentication','BillingService','$uibModal','toastr',
  function ($scope,Authentication,BillingService,$uibModal,toastr) {
    $scope.user = Authentication.user;

    $scope.getInvoices = getInvoices;
    $scope.getBillingInfo = getBillingInfo;
    $scope.getSubscription = getSubscription;

    $scope.changeCreditCard = function (){
      BillingService.openCreditCardModal(getBillingInfo);
    };

    $scope.updateSubscription = function(){
      BillingService.openSelectPlanModal({allow_choice:true,period:12,plan_id:Authentication.user.plan}, getSubscription);
    };

    getSubscription();
    getBillingInfo();
    getInvoices();

    function getSubscription(){
      BillingService.getSubscription(function (mySubscription) {
        if(mySubscription.plan) {
          $scope.mySubscription = mySubscription;
        }else {
          $scope.mySubscription = {free:true};
        }
      });
    }

    function getInvoices(){
      BillingService.getInvoices(function(invoices) {
        $scope.invoices = invoices;
      });
    }

    function getBillingInfo(){
      BillingService.getBillingInfo(function successCallback(billing) {
          $scope.billing = billing;
      });
    }
  }
]);
