'use strict';

angular.module('process')
    .controller('ProcessWizardMainController',
    ['$state', '$stateParams', 'Authentication', 'toastr', '$log', 'ProcessStateService',
        function ($state, $stateParams, Authentication, toastr, $log, ProcessStateService) {
            var vm = this;

            vm.user = Authentication.user;

            vm.changeState = function(state){
                ProcessStateService.changeState(state);
                $state.go(state);
            };

            vm.goBack = function(){
                $state.go(ProcessStateService.previouseState());
            };

        }]);
