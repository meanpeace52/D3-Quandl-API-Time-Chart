'use strict';

angular.module('process')
    .controller('ProcessWizardStep1Controller',
    ['$state', '$stateParams', 'Authentication', 'toastr', '$log', 'ProcessStateService', 'Process',
        function ($state, $stateParams, Authentication, toastr, $log, ProcessStateService, Process) {
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
                    if (vm.selectedworkflow.type === 'new-model'){
                        state = 'lab.process2.step2.newmodel';
                    }
                    else{
                        state = 'lab.process2.step2.existingmodel';
                    }

                    ProcessStateService.saveProcessData({
                        selecteddataset : vm.selectedworkflow.dataset,
                        step1selection : vm.selectedworkflow.type
                    });
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

                ProcessStateService.changeState(state);
                $state.go(state);
            };

        }]);
