'use strict';

angular.module('admin.users')

.controller('AdminUserDetailController', ['$state', 'Authentication', 'User',
    function ($state, Authentication, User) {
        var vm = this;
        vm.authentication = Authentication;
        vm.user = User;

        vm.remove = function (user) {
            if (confirm('Are you sure you want to delete this user?')) {
                if (user) {
                    user.$remove();

                    vm.users.splice(vm.users.indexOf(user), 1);
                } else {
                    vm.user.$remove(function () {
                        $state.go('admin.users');
                    });
                }
            }
        };

    }
]);
