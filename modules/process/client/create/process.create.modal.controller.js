'use strict';

angular.module('process')
    .controller('ProcessModalController',
        ['$modalInstance', 'tasks',
            function ($modalInstance, tasks) {
                var vm = this;

        vm.tasks = tasks;
        vm.tasks.forEach(function(task, i) {
          task.status = {
            open: i === 0
          };
          return task;
        });

        vm.copiedTasks = [];
        vm.onCopy = function(event, index, item) {
          if (!_.find(vm.copiedTasks, item)) {
            vm.copiedTasks.splice(index, 0, item);
          }
          return true;
        };
    }]);
