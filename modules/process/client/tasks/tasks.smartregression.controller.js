'use strict';

angular.module('process')
    .controller('SmartRegressionOptionsController', ['$stateParams', 'ProcessStateService', 'toastr',

        function($stateParams, ProcessStateService, toastr) {

            var vm = this;

            vm.columns = ProcessStateService.getSelectedDataset().columns;

            vm.options = $stateParams.options;

            vm.update = function(){
                var currentProcess = ProcessStateService.currentProcessTasksData();
                currentProcess.tasks[$stateParams.id].options = vm.options;
                ProcessStateService.saveProcessTasksData(currentProcess);
                toastr.success('Updated options successfully!');
            };

        }]);
