'use strict';

//Posts Create Controller
angular.module('posts')
    .controller('PostsCreateController',
        ['$scope', '$state', 'Authentication', 'Posts',
            function ($scope, $state, Authentication, Posts) {
                var vm = this;

                vm.authentification = Authentication;
                vm.post = new Posts();

                // Create new Post
                vm.create = function (isValid) {
                    vm.error = null;

                    if (!isValid) {
                        $scope.$broadcast('show-errors-check-validity', 'postForm');

                        return false;
                    }

                    // Redirect after save
                    vm.post.$save(function (response) {
                        $state.go('posts.detail', { postId: response._id });

                    }, function (errorResponse) {
                        vm.error = errorResponse.data.message;
                    });
                };
            }]);
