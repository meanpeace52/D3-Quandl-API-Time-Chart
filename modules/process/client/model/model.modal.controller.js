'use strict';

angular.module('process')
    .controller('ModelModalController',
        ['$uibModalInstance', '$state', '$stateParams', 'model',
          function ($uibModalInstance, $state, $stateParams, model) {
            var vm = this;

        vm.model = model;

        vm.save = function() {
          $uibModalInstance.close();
        };

        vm.discard = function() {
          $uibModalInstance.dismiss();
        };

    }]);
