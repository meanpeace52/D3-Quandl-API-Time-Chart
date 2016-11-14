'use strict';

angular.module('process')
    .controller('ProcessWizardStep1Controller',
    ['$state', '$stateParams', 'Authentication', 'toastr', '$log', 'ProcessStateService',
        function ($state, $stateParams, Authentication, toastr, $log, ProcessStateService) {
            var vm = this;

            vm.selectedoption = 'lab.process2.step2.existingmodel';

            vm.user = Authentication.user;

            ProcessStateService.saveProcessData({});
            ProcessStateService.saveProcessTasksData({
                title : '',
                tasks : []
            });
            ProcessStateService.setSelectedDataset({});
            ProcessStateService.saveTransformSteps([]);
            ProcessStateService.setState('lab.process2.step1');

            vm.setSelectedOption = function(state){
                ProcessStateService.changeState(state);
                $state.go(state);
            };

        }]);
