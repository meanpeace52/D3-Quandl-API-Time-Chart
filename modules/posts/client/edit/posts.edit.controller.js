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
                    posts.crud.update({
                        post: vm.post,
                        postId: $stateParams.postId
                    }).$promise.then(function (response) {
                            $state.go('posts.detail', {
                                postId: response._id
                            });
                            toastr.success('Post updated successfully.');
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

            vm.addModel = function(model){
                if (!vm.post.models){
                    vm.post.models = [];
                }
                vm.post.models.push(model);
            };

            vm.addDataset = function(dataset){
                if (!vm.post.datasets){
                    vm.post.datasets = [];
                }
                vm.post.datasets.push(dataset);
            };

            vm.addExistingFile = function(existingFile){
                if (!vm.post.files){
                    vm.post.files = [];
                }
                vm.post.files.push(existingFile);
            };

            // IMPORTANT : fileuploader must be kept on $scope because of bug with controllerAs
            $scope.uploader = new FileUploader({
                url: 'api/users/files'
            });

            // Called after the user selected a new picture file
            $scope.uploader.onAfterAddingFile = function (fileItem) {
                if ($window.FileReader) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(fileItem._file);
                    fileReader.onload = function (event) {
                        $timeout(function () {
                            var pdfData = {
                                name: fileItem.file.name,
                                file: event.target.result
                            };
                            $scope.upload(pdfData);
                        }, 0);
                    };
                }
            };

            $scope.upload = function (file) {
                // Clear messages
                vm.success = vm.error = null;

                // Start upload
                $scope.uploader.uploadAll();

            };

            // Cancel the upload process
            $scope.cancelUpload = function () {
                $scope.uploader.clearQueue();
            };


            // Called after the user has successfully uploaded a new picture
            $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
                // Show success message
                vm.success = true;

                if (!vm.post.files){
                    vm.post.files = [];
                }
                vm.post.files.push({ name : response.file.name, _id : response.file._id });
                // Clear upload buttons
                $scope.cancelUpload();
            };

            $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
                // Clear upload buttons
                $scope.cancelUpload();

                // Show error message
                vm.error = response.message;
            };

            Models.filter('user', Authentication.user._id)
                .then(function (res) {
                    vm.models = res.data;
                },
                function (error) {

                });

            Datasets.user(Authentication.user.username)
                .then(function (res) {
                    vm.datasets = res.data;
                },
                function (error) {

                });

    }]);
