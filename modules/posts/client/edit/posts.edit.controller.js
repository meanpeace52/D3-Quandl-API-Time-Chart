'use strict';

//posts Edit Controller
angular.module('posts')
    .controller('postsEditController', ['$scope', '$state', '$stateParams', 'Authentication', 'posts', '$uibModal', '$window', '$timeout', 'FileUploader', 'postOptions',
                'Models', 'Datasets', '$log', 'toastr',
            function ($scope, $state, $stateParams, Authentication, posts, $uibModal, $window, $timeout, FileUploader, postOptions, Models, Datasets, $log, toastr) {
            var vm = this;

            vm.user = Authentication.user;

            vm.submitted = false;

            vm.error = null;

            vm.postOptions = postOptions;

            vm.post = {
            };

            vm.get = function () {
                posts.crud.get({
                    postId: $stateParams.postId
                }).$promise.then(function (res) {
                    vm.post = res;
                }, function (err) {
                    vm.error = err;
                });
            };

            vm.get();

            vm.update = function (form) {
                vm.error = null;
                vm.submitted = true;

                if (form.$valid){

                    if (vm.post.access !== 'for sale'){
                        vm.post.cost = null;
                        vm.post.previewnote = null;
                    }

                    posts.crud.update({
                        post: vm.post,
                        postId: $stateParams.postId
                    }).$promise.then(function (response) {
                            $state.go('posts.editstep2', {
                                postId: response._id
                            });
                        }, function (err) {
                            vm.error = err.message;
                            toastr.error('An error occurred when trying to save the post. Please try again.');
                        });
                }
                else{
                    $scope.$broadcast('show-errors-check-validity', 'form');
                    toastr.error('Please fix the errors before you can continue.');
                }
            };

    }]);
