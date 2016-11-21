'use strict';

angular.module('process')
    .controller('ProcessWizardStep1Controller',
    ['$state', '$stateParams', 'Authentication', 'toastr', '$log', 'ProcessStateService', 'Process', '$localStorage',
        function ($state, $stateParams, Authentication, toastr, $log, ProcessStateService, Process, $localStorage) {
            var vm = this;

            vm.selectedoption = 'lab.process2.step2.existingmodel';

            vm.user = Authentication.user;

            Process.getByUser()
                .then(function(workflows){
                    vm.workflows = workflows;
                })
                .catch(function(err){
                    $log.error(err);
                    toastr.error('Error loading saved workflows.');
                });

            ProcessStateService.saveProcessData({});
            ProcessStateService.saveProcessTasksData({
                title : '',
                tasks : []
            });
            ProcessStateService.setSelectedDataset({});
            ProcessStateService.saveTransformSteps([]);
            ProcessStateService.setState('lab.process2.step1');

            vm.setSelectedOption = function(state){
                if (state === 'lab.process2.step2.loadworkflow'){
                    state = 'lab.process2.step3';

                    $localStorage.savedWorkflow = true;

                    var processData = {
                        selecteddataset : vm.selectedworkflow.dataset,
                        step1selection : vm.selectedworkflow.type
                    };

                    if (vm.selectedworkflow.type === 'existing-model'){
                        processData.selectedmodel = vm.selectedworkflow.model;
                    }

                    ProcessStateService.saveProcessData(processData);
                    ProcessStateService.saveProcessTasksData({
                        _id : vm.selectedworkflow._id,
                        title : vm.selectedworkflow.title,
                        tasks : vm.selectedworkflow.tasks
                    });

                    var initialTransformation = _.find(vm.selectedworkflow.tasks, { title : 'Initial Transformations' });

                    if (initialTransformation){
                        ProcessStateService.saveTransformSteps(initialTransformation.options.transformSteps);
                    }
                }
                else{
                    $localStorage.savedWorkflow = false;
                }

                ProcessStateService.changeState(state);
                $state.go(state);
            };

        }]);
