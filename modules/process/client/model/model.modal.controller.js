'use strict';

angular.module('process')
    .controller('ModelModalController',
        ['$uibModalInstance', '$state', '$stateParams', 'tasks', 'results',
          function ($uibModalInstance, $state, $stateParams, tasks, results) {
            var vm = this;

        vm.model = null;
        vm.dataset = null;

        var lastResult = _.last(results);
        if (Array.isArray(lastResult)) {
          vm.model = {
            type: 'Linear Regression',
            equation: 'Some equation',
            output: lastResult
          };
          vm.dataset = _.last(_.dropRight(results));
        } else {
          vm.dataset = lastResult;
        }

        vm.save = function() {
          $uibModalInstance.close();
        };

        vm.discard = function() {
          $uibModalInstance.dismiss();
        };

    }]);
