'use strict';

angular.module('process')
    .controller('ProcessWizardStep1Controller',
    ['$state', '$stateParams', 'Authentication', 'toastr', '$log', 'ProcessStateService', 'Process', '$localStorage', 'UsersFactory',
        function ($state, $stateParams, Authentication, toastr, $log, ProcessStateService, Process, $localStorage, UsersFactory) {
            var vm = this;

            vm.selectedoption = 'lab.process2.step2.existingmodel';

            vm.user = Authentication.user;

            UsersFactory.userData('datasets', vm.user.username)
                .then(function (datasets) {
                    vm.usersDatasets = datasets;
                });

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

                    vm.selecteddataset = _.find(vm.usersDatasets, { _id : vm.selectedworkflow.dataset });

                    var processData = {
                        selecteddataset : vm.selectedworkflow.dataset,
                        selecteddatasets3reference : vm.selecteddataset.s3reference,
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
