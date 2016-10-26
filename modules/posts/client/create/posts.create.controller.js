'use strict';

//posts Create Controller
angular.module('posts')
    .controller('postsCreateController', ['$scope', '$state', 'Authentication', 'posts', 'postOptions', '$uibModal', '$window', '$timeout', 'FileUploader', 'Models', 'Datasets', '$log', 'toastr',
            function ($scope, $state, Authentication, posts, postOptions, $uibModal, $window, $timeout, FileUploader, Models, Datasets, $log, toastr) {

            var vm = this;

            vm.submitted = false;

            vm.user = Authentication.user;

            vm.error = null;

            vm.postOptions = postOptions;

            // Create new post
            vm.post = {
                access : 'public'
            };

            vm.step1 = function(form){
                vm.submitted = true;
                vm.error = null;

                if (form.$valid){
                    posts.create(vm.post)
                        .then(function(response){
                            toastr.success('Post created successfully, now you can attach datasets, models or .pdfs!');
                            $state.go('posts.createstep2', {
                                postId: response._id
                            });
                        })
                        .catch(function(err){
                            $log.error(err);
                            toastr.error('An error occurred when trying to save the post. Please try again.');
                        });
                }
                else{
                    toastr.error('Please fix the errors before you can continue.');
                    $scope.$broadcast('show-errors-check-validity', 'form');
                }
            };
}]);
