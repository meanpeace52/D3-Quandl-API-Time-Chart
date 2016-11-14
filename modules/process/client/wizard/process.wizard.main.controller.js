'use strict';

angular.module('process')
    .controller('ProcessWizardMainController',
    ['$state', '$scope', '$stateParams', 'Authentication', 'toastr', '$log', 'ProcessStateService',
        function ($state, $scope, $stateParams, Authentication, toastr, $log, ProcessStateService) {
            var vm = this;

            vm.user = Authentication.user;

            vm.changeState = function(state){
                ProcessStateService.changeState(state);
                $state.go(state);
            };

            $scope.$on('changeState', function(e, data){
                vm.changeState(data);
            });

            vm.goBack = function(){
                $state.go(ProcessStateService.previousState());
            };

        }]);
