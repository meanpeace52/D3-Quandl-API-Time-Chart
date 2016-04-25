'use strict';

angular.module('admin.users')

.controller('AdminUserEditController', ['$scope', '$state', 'Authentication', 'User',
    function ($scope, $state, Authentication, User) {
        var vm = this;
        vm.authentication = Authentication;
        vm.user = User;

        vm.update = function (isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');

                return false;
            }

            vm.user.$update(function () {
                $state.go('admin.user.detail', { userId: vm.user._id });
            }, function (errorResponse) {
                vm.error = errorResponse.data.message;
            });
        };
    }
]);
