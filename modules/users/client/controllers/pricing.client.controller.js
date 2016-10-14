'use strict';

//users List Controller
angular.module('users')
    .controller('PricingController', ['$state','Authentication','BillingService','$scope','$uibModal','$location',
        function ($state, Authentication, BillingService, $scope, $uibModal, $location) {
          var rPlans;
          var plans = {
            free:{name: 'Free',
              from: 0,
              features:{
                'Feature 1': 'no',
                'Feature 2': 'no',
                'Feature 3': 'no',
              }
            },
            premium:{name:'Premium',
              from: 1000,
              features:{
                'Feature 1': 'ok',
                'Feature 2': '20 GB',
                'Feature 3': '1 widget',
              }
            },
            small_business:{name:'Small Business',
              from: 1000,
              color:'primary',
              features:{
                'Feature 1': 'ok',
                'Feature 2': '50 GB',
                'Feature 3': '2 widgets',
              }
            },
            enterprise:{name:'Enterprise',
              from: 1000,
              features:{
                'Feature 1': 'ok',
                'Feature 2': '100 GB',
                'Feature 3': '5 widgets',
              }
            }
          };
          $scope.user = Authentication.user;
          BillingService.getPlans().then(function successCallback(response) {
            rPlans = response.data;
            for (var i = 0; i < rPlans.length; i++) {
              if(rPlans[i].price / rPlans[i].period < plans[rPlans[i].id].from ){
                plans[rPlans[i].id].from = rPlans[i].price / rPlans[i].period;
              }
            }
            $scope.plans = [];
            for (var o in plans) {
              plans[o].id = o;
              if( !plans[o].color ) plans[o].color = 'default';
              if( plans[o].id == $scope.user.plan ) plans[o].color = 'success';
              $scope.plans.push(plans[o]);
            }
            $scope.plans.sort(function(a,b) {return (a.from > b.from) ? 1 : ((b.from > a.from) ? -1 : 0);} );
          }, function errorCallback(response) {

          });


          $scope.selectPlan = function(plan_id){
            openCheckoutModal(plan_id, function(token, stripe_plan_id){
              BillingService.subscribe(token, stripe_plan_id).then(function successCallback(response) {
                for (var i = 0; i < rPlans.length; i++) {
                  if( rPlans[i].stripe_id == stripe_plan_id){
                    Authentication.user.plan = rPlans[i].id;
                    $location.path('settings/billing');
                  }
                }
              }, function errorCallback(response) {

              });
            });
          };


          function openCheckoutModal (plan_id, next){
            var modalInstance = $uibModal.open({
              templateUrl: 'checkoutForm.html',
              controller: function($scope){
                $scope.plans = rPlans;
                $scope.cancel = function(){
                  modalInstance.close();
                };
                $scope.planOptions = [{id:'premium',name:"Premium"},{id:'small_business',name:"Small Business"},{id:"enterprise",name:"Enterprise"}];
                $scope.periodOptions = [{val:12,name:"Yearly"},{val:6,name:"6 Months"},{val:1,name:"Monthly"}];
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
                      if(p.id == $scope.selectedPlan.id && p.period == $scope.selectedPeriod.val ){
                        $scope.price = p.price;
                        $scope.stripe_plan_id = p.stripe_id;
                      }
                    }
                  }
                };
                $scope.getPrice($scope.selectedPeriod);

                $scope.stripeCallback = function (code, result) {
                    if (result.error) {
                        $scope.carderror = result.error.message;
                    } else {
                      next(result.id, $scope.stripe_plan_id);
                      modalInstance.close();
                    }
                };
              }
            });
          }

    }]);
