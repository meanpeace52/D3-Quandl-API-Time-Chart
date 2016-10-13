'use strict';

angular.module('users').controller('BillingController', ['$scope', 'Authentication','BillingService'  ,'$uibModal',
  function ($scope, Authentication, BillingService,$uibModal) {
    $scope.user = Authentication.user;

    $scope.getInvoices = getInvoices;
    $scope.getBillingInfo = getBillingInfo;
    $scope.getSubscription = getSubscription;

    $scope.planId = $scope.user.plan;
    $scope.period = 1;

    $scope.planOptions = [{id:'premium',name:"Premium"},{id:'small_business',name:"Small Business"},{id:"enterprise",name:"Enterprise"}];
    $scope.periodOptions = [{val:12,name:"Yearly"},{val:6,name:"6 Months"},{val:1,name:"Monthly"}];
    $scope.selectedPlan = $scope.planOptions[0];
    $scope.selectedPeriod = $scope.periodOptions[0];

    $scope.getPrice = function (data){
      if(data.id) $scope.selectedPlan = data;
      if(data.val) $scope.selectedPeriod = data;
      console.log($scope.selectedPeriod);
      console.log($scope.selectedPlan);
      console.log(data);
      if($scope.plans){
        for (var i = 0; i < $scope.plans.length; i++) {
          var p = $scope.plans[i];
          if(p.id == $scope.selectedPlan.id && p.period == $scope.selectedPeriod.val ){
            $scope.price = p.price;
            $scope.stripe_plan_id = p.stripe_id;
            console.log(p);
          }
        }
      }
    };


    getSubscription();
    getBillingInfo();
    getInvoices();


    BillingService.getPlans().then(function successCallback(response) {
        $scope.plans = response.data;
        for (var i = 0; i < $scope.plans.length; i++) {
          if(Authentication.user.plan == $scope.plans[i].id) $scope.selected_plan = $scope.plans[i];
          break;
        }
        $scope.getPrice($scope.selectedPlan);
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

    function getInvoices(){
      BillingService.getInvoices().then(function successCallback(response) {
          $scope.invoices = response.data;
      }, function errorCallback(response) {
          $scope.error = 'something went wrong';
      });
    }

    $scope.selectPlan = function (){
      askForCreditCard(function(token){
        subscribeToPlan(token);
      });
    };

    $scope.changeCreditCard = function (){
      askForCreditCard(function(token){
        changeCreditCard(token);
      });
    };

    function getBillingInfo(){
      BillingService.getBillingInfo().then(function successCallback(response) {
          $scope.billing = response.data;
      }, function errorCallback(response) {

      });
    }


    function subscribeToPlan(token){
      BillingService.subscribe(token, $scope.selected_plan.id).then(function successCallback(response) {
          $scope.confirmation = 'Awesome you successfully subscribed to a new plan : ' + $scope.selected_plan.name;
          getSubscription();
          $scope.user.plan = $scope.stripe_plan_id ;
      }, function errorCallback(response) {
          $scope.carderror = 'sorry your card was declined';
      });
    }


    function changeCreditCard(token){
      BillingService.updateCard(token).then(function successCallback(response) {
          getBillingInfo();
      }, function errorCallback(response) {

      });
    }



    function askForCreditCard (next){
      var modalInstance = $uibModal.open({
        templateUrl: 'creditCardForm.html',
        size: 'sm',
        controller: function($scope){
          $scope.cancel = function(){
            modalInstance.close();
          };
          $scope.stripeCallback = function (code, result) {
              if (result.error) {
                  $scope.carderror = result.error.message;
              } else {
                next(result.id);
                modalInstance.close();
              }
          };
        }
      });
    }
  }
]);
