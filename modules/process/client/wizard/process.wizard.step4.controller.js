'use strict';

angular.module('process')
    .controller('ProcessWizardStep4Controller',
    ['$state', '$stateParams', '$timeout', 'Tasks', 'Deployr', '$uibModal',
        function ($state, $stateParams, $timeout, Tasks, Deployr, $uibModal) {
            var baseStateUrl = 'lab.process2.step4';
            var vm = this;
            var runningTask = null;
            vm.showProcessLoader = false;

            vm.taskoptionsview = '';

            vm.process = {
                title: '',
                tasks: []
            };

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

            function getRowsFromResult(result, columns) {
                return _.zip.apply(_, result[0].value.map(function (obj) {
                    return obj.value;
                })).map(function (rowValues) {
                    var row = {};
                    rowValues.forEach(function (rowValue, i) {
                        row[columns[i]] = rowValue;
                    });
                    return row;
                });
            }

            function process(inputFile, tasks, deferred, results) {
                if (!deferred) deferred = $q.defer();
                if (!results) results = [];
                Deployr.run(inputFile, tasks[0])
                    .then(function (res) {
                        var result = res;
                        if (tasks[0].returnType === 'dataset') {
                            if (!result.length) {
                                return deferred.reject('one of the tasks returned empty dataset!');
                            }
                            var _dataset = {
                                columns: result[0].value.map(function (obj) {
                                    return obj.name;
                                })
                            };
                            _dataset.rows = getRowsFromResult(result, _dataset.columns);
                            results.push(_dataset);
                            if (typeof tasks[1] !== 'undefined') {
                                return process(_dataset, _.drop(tasks), deferred, results);
                            }
                        } else {
                            results.push(result);
                        }
                        return deferred.resolve(results);
                    }).catch(function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            }

            vm.performProcess = function () {
                var invalidTasks = vm.process.tasks.filter(function (task) {
                    return task.validate && !task.validate(task.options);
                });
                if (invalidTasks.length) {
                    toastr.error('Please select the required options for the tasks present in the process!');
                    return;
                }
                vm.showProcessLoader = true;
                process(vm.s3reference, vm.process.tasks.filter(function (task) {
                    return task.script;
                }))
                    .then(function (results) {
                        if (results[0].status === 200) {
                            var modalInstance = $uibModal.open({
                                controller: 'ModelModalController',
                                controllerAs: 'ModelModal',
                                templateUrl: 'modules/process/client/model/model.modal.html',
                                size: 'md',
                                backdrop: true,
                                resolve: {
                                    selectedDataset: function () {
                                        return Process.getSelectedDataset();
                                    },
                                    tasks: function () {
                                        return vm.process.tasks;
                                    },
                                    results: function () {
                                        return [results[0].text];
                                    }
                                }
                            });
                            modalInstance.result.then(function (model) {
                                vm.alerts.push({
                                    type: 'success',
                                    msg: 'The result has been successfully saved!'
                                });
                                getDatasets();
                            });
                        }
                        else {
                            $log.debug(results);
                            toastr.error('An error occurred while processing.');
                        }

                    })
                    .catch(function (err) {
                        console.log('error', err);
                        if (err instanceof Error) {
                            alert(err.message || err);
                        }
                    })
                    .finally(function () {
                        vm.showProcessLoader = false;
                    });
            };

            vm.cancelProcess = function () {
                if (runningTask) {
                    runningTask.cancel(true);
                    runningTask = null;
                }
            };

        }]);
