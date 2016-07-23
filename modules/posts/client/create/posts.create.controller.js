'use strict';

//posts Create Controller
angular.module('posts')
    .controller('postsCreateController', ['$scope', '$state', 'Authentication', 'posts',
            function ($scope, $state, Authentication, posts) {

            var vm = this;

            vm.authentification = Authentication;

            vm.error = null;

            // Create new post

            vm.create = function (isValid) {

                vm.error = null;

                if (!isValid) {
                    $scope.$broadcast('show-errors-check-validity', 'postForm');

                    return false;
                }

                var post = vm.post;
                
                posts.create(post).then(function (response) {
                    $state.go('posts.detail', {
                        postId: response._id
                    });
                }, function (err) {
                    vm.error = err.message;
                });
            };

            }]);
