'use strict';

//users List Controller
angular.module('users')
    .controller('PricingController', ['$state','Authentication','BillingService','$scope','$uibModal','$location','toastr',
        function ($state, Authentication, BillingService, $scope, $uibModal, $location, toastr) {
          var rPlans;
          var plans = {
            free:{name: 'Free',
              from: 0,
              features:[
                {name:'Feature 1', value:false},
                {name:'Feature 2', value:false},
                {name:'Feature 3', value:false},
              ]
            },
            premium:{name:'Premium',
              from: 1000,
              features:[
                {name:'Feature 1', value:true},
                '2 GB Storage',
                '1 widget',
              ]
            },
            small_business:{name:'Small Business',
              from: 1000,
              color:'primary',
              features:[
                {name:'Feature 1', value:true},
                '50 GB Storage',
                '2 widgets',
              ]
            },
            enterprise:{name:'Enterprise',
              from: 1000,
              features:[
                {name:'Feature 1', value:true},
                '50 GB Storage',
                '10 widgets',
              ]
            }
          };

          $scope.user = Authentication.user;

          $scope.planChoice = {};

          $scope.selectPlan = function(plan_id, period){
            BillingService.openSelectPlanModal({ plan_id:plan_id, period:period, allow_choice:false }, function(){
              getPlans();
              $location.path('settings/billing');
            });
          };

          getPlans();

          function getPlans(){
            BillingService.getPlans(function(plans){
              rPlans = plans;
              formatPlans();
            });
          }

          function formatPlans(){
            for (var i = 0; i < rPlans.length; i++) {
              if(rPlans[i].price/rPlans[i].period<plans[rPlans[i].id].from){
                plans[rPlans[i].id].from = rPlans[i].price / rPlans[i].period;
                $scope.planChoice[rPlans[i].id] = {stripe_id:false};
              }
              if(!plans[rPlans[i].id].periods) plans[rPlans[i].id].periods = [];
              plans[rPlans[i].id].periods.push({price : rPlans[i].price, period : rPlans[i].period});
            }
            $scope.plans = [];
            for (var o in plans) {
              plans[o].id = o;
              if(!plans[o].color) plans[o].color = 'default';
              if(plans[o].id==$scope.user.plan) plans[o].color = 'success';
              $scope.plans.push(plans[o]);
            }
            $scope.plans.sort(function(a,b) {return (a.from>b.from) ? 1 : ((b.from>a.from) ? -1 : 0);});
          }

    }]);
