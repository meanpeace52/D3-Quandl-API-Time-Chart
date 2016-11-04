'use strict';

angular.module('process')
    .controller('ProcessWizardStep1Controller',
    ['$state', '$stateParams', 'Authentication', 'toastr', '$log', 'ProcessStateService',
        function ($state, $stateParams, Authentication, toastr, $log, ProcessStateService) {
            var vm = this;

            vm.user = Authentication.user;

            ProcessStateService.setState(['lab.process2.step1']);

        }]);
