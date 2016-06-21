'use strict';

angular.module('process')
    .controller('ProcessModalController',
        ['$state', 'Tasks', 'selectedTasks',
          function ($state, Tasks, selectedTasks) {
            var baseStateUrl = 'lab.process.popup.taskoptions';
            var vm = this;

        vm.tasks = Tasks.getTasks();
        vm.tasks.forEach(function(task, i) {
          task.status = {
            open: i === 0
          };
          return task;
        });

        // save current task options before closing the modal,
        // or showing options for another task
        function updateTaskOptions() {
          if ($state.params && $state.params.options) {
            var slug = $state.current.url.slice(1);
            var task = _.find(vm.copiedTasks, function(task) {
              return task.slug === slug;
            });
            if (task) {
              task.options = $state.params.options;
            }
          }
        }

        vm.copiedTasks = selectedTasks || [];
        vm.onCopy = function(event, index, item) {
          if (!_.find(vm.copiedTasks, item)) {
            updateTaskOptions();
            vm.copiedTasks.splice(index, 0, item);
            if (item.slug) {
              $state.go(baseStateUrl + '.' + item.slug, {options: item.options});
            }
          }
          return true;
        };

        vm.ok = function() {
          updateTaskOptions();
          $state.go('lab.process', {data: {tasks: vm.copiedTasks}}, {reload: true});
        };
    }]);
