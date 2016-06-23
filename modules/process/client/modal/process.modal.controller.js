'use strict';

angular.module('process')
    .controller('ProcessModalController',
        ['$state', '$stateParams', 'Tasks', 'process',
          function ($state, $stateParams, Tasks, process) {
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

        function showTaskOptions(task) {
          if (task.slug) {
            $state.go(baseStateUrl + '.' + task.slug, {options: task.options});
          } else {
            $state.go('lab.process.popup');
          }
        }

        vm.copiedTasks = (process || {}).tasks || [];
        vm.onCopy = function(event, index, task) {
          if (!_.find(vm.copiedTasks, {title: task.title})) {
            updateTaskOptions();
            vm.copiedTasks.splice(index, 0, task);
            showTaskOptions(vm.copiedTasks[index]);
          }
          return true;
        };

        vm.onTaskClick = function(task) {
          showTaskOptions(task);
        };

        vm.ok = function() {
          updateTaskOptions();
          $state.go('lab.process', {
            data: {
              tasks: vm.copiedTasks,
              type: $stateParams.type
            }
          }, {
            reload: true
          });
        };
    }]);
