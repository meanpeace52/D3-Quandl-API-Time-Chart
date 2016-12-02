'use strict';

angular.module('process')
    .controller('PredictOptionsController', ['$stateParams', 'ProcessStateService', 'toastr', '$rootScope',
        function($stateParams, ProcessStateService, toastr, $rootScope) {

            var vm = this;

            vm.options = $stateParams.options;

            vm.tasks = ProcessStateService.currentProcessTasksData().tasks;

            var currentTaskIndex = -1;
            vm.models = _.filter(vm.tasks, function(task){
                currentTaskIndex++;
                task.step = currentTaskIndex + 1;
                return currentTaskIndex < $stateParams.id && task.returnType === 'model';
            });

            vm.update = function(){
                var currentProcess = ProcessStateService.currentProcessTasksData();
                currentProcess.tasks[$stateParams.id].options = vm.options;
                ProcessStateService.saveProcessTasksData(currentProcess);
                toastr.success('Updated options successfully!');
            };

        }]);
