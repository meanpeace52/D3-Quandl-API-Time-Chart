'use strict';

//datasets List Controller
angular.module('datasets').controller('SendMessageModalController', ['$uibModalInstance', 'profileUser', 'toastr', 'UsersFactory', '$log', '$scope',
    function ($uibModalInstance, profileUser, toastr, UsersFactory, $log, $scope) {
        var vm = this;

        vm.username = profileUser;
        vm.submitted = false;
        vm.btnText = 'Send';

        vm.ok = function(form, subject, message){

            vm.submitted = true;

            if (!form.$valid) {
                $scope.$broadcast('show-errors-check-validity', 'form');
                return false;
            }

            if (form.$valid){
                vm.btnText = 'Sending...';
                UsersFactory.sendUserProfileEmail(vm.username, subject, message)
                    .then(function(){
                        toastr.success('Message sent successfully!');
                        vm.btnText = 'Send';
                        $uibModalInstance.close();
                    })
                    .catch(function(err){
                        $log.error(err);
                        vm.btnText = 'Send';
                        toastr.error('Error sending message.');
                    });
            }
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }]);
