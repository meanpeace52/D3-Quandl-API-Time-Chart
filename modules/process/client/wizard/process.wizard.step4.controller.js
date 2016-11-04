'use strict';

angular.module('process')
    .controller('ProcessWizardStep4Controller',
    ['$state', '$stateParams', 'Authentication', 'toastr', '$log',
        function ($state, $stateParams, Authentication, toastr, $log) {
            var vm = this;

            vm.user = Authentication.user;



        }]);
