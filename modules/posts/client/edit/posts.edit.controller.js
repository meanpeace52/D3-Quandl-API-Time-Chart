'use strict';

//posts Edit Controller
angular.module('posts')
    .controller('postsEditController',
        ['$scope', '$state', '$stateParams', 'Authentication', 'posts',
            function ($scope, $state, $stateParams, Authentication, posts) {
                var vm = this;

                vm.authentication = Authentication;

                vm.post = posts.get({
                    postId: $stateParams.postId
                });

                vm.update = function () {

                    vm.post.$update(function () {
                        $state.go('posts.detail', { postId: vm.post._id });

                    }, function (errorResponse) {
                        vm.error = errorResponse.data.message;
                    });
                };

            }]);
