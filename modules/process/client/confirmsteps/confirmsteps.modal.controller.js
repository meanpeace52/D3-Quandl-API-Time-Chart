'use strict';

angular.module('process')
    .controller('ConfirmStepsModalController',
        ['$state', '$stateParams', '$timeout', 'transformSteps', '$uibModalInstance',
        function ($state, $stateParams, $timeout, transformSteps, $uibModalInstance) {

            var vm = this;

            vm.transformSteps = transformSteps;

            vm.ok = function() {
                $uibModalInstance.close();
            };

            vm.cancel = function() {
                $uibModalInstance.dismiss();
            };
        }]);
