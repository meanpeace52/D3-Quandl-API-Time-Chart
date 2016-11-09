'use strict';

angular.module('process')
    .controller('ProcessWizardStep4Controller',
    ['$state', '$stateParams', '$timeout', 'Tasks',
        function ($state, $stateParams, $timeout, Tasks) {
            var baseStateUrl = 'lab.process2.step4';
            var vm = this;
            vm.taskoptionsview = '';

            vm.process = {
                title: '',
                tasks: []
            };
            vm.type = $stateParams.type;
            vm.tasks = Tasks.getTasks();
            vm.tasks.forEach(function(task, i) {
                task.status = {
                    open: i === 0
                };
                task.subtasks.forEach(function(subtask) {
                    subtask.color = task.color;
                });
            });

            // we only have title and slug in the received process
            // therefore, appending returnTypes from the tasks static array
            vm.process.tasks.forEach(function(task) {
                task.returnType = _.compact(vm.tasks.map(function(_task) {
                    return _.find(_task.subtasks, {title: task.title});
                }))[0].returnType;
            });

            vm.showPlaceholderArrow = true;


            // save current task options before closing the modal,
            // or showing options for another task
            function updateTaskOptions() {
                /*if ($state.params && $state.params.options) {
                    var slug = $state.current.url.slice(1);
                    var task = _.find(vm.process.tasks, function(task) {
                        return task.slug === slug;
                    });
                    if (task) {
                        task.options = $state.params.options;
                    }
                }*/
            }

            function showTaskOptions(task) {
                vm.taskoptionsview = task.slug;
                if (task.slug) {
                    $state.go(baseStateUrl + '.' + task.slug, {options: task.options});
                } else {
                    //$state.go('lab.process.popup');
                }
            }

            // disable drag if this task is already dropped
            vm.disableDrag = function(task) {
                return _.find(vm.process.tasks, {title: task.title});
            };

            // 1. Set a boolean indicating if the task is of type dataset or
            // model.
            // 2. disallow any task with return type "model" to be dropped
            // in between other tasks
            // 3. disallow any task to be added next to a task having return
            // type "model".
            vm.onDrag = function(event, index, type) {
                $timeout(function() {
                    vm.showPlaceholderArrow = type === 'dataset';
                }, 0);
                return !((type === 'model' && index <= vm.process.tasks.length - 1) ||
                ((_.last(vm.process.tasks) || {}).returnType === 'model' && index >= vm.process.tasks.length));
            };

            vm.onCopy = function(event, index, task) {
                if (!_.find(vm.process.tasks, {title: task.title})) {
                    updateTaskOptions();
                    vm.process.tasks.splice(index, 0, task);
                    showTaskOptions(vm.process.tasks[index]);
                }
                return true;
            };

            vm.onTaskClick = function(task) {
                showTaskOptions(task);
            };

        }]);
