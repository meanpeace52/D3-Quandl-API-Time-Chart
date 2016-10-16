'use strict';

//users List Controller
angular.module('users')
    .controller('PricingController', ['$state','Authentication','BillingService','$scope','$uibModal','$location','toastr',
        function ($state, Authentication, BillingService, $scope, $uibModal, $location, toastr) {
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

          BillingService.getPlans(function(plans){
            rPlans = plans;
            formatPlans();
          });

          $scope.selectPlan = function(plan_id){
            BillingService.openSelectPlanModal(plan_id, function(){
              formatPlans();
              $location.path('settings/billing');
            });
          };

          function formatPlans(){
            for (var i = 0; i < rPlans.length; i++) {
              if(rPlans[i].price/rPlans[i].period<plans[rPlans[i].id].from){
                plans[rPlans[i].id].from = rPlans[i].price / rPlans[i].period;
              }
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
