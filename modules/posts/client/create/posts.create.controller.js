'use strict';

//posts Create Controller
angular.module('posts')
    .controller('postsCreateController', ['$scope', '$state', 'Authentication', 'posts', 'postOptions', '$uibModal', '$window', '$timeout', 'FileUploader',
            function ($scope, $state, Authentication, posts, postOptions, $uibModal, $window, $timeout, FileUploader) {

            var vm = this;

            vm.user = Authentication.user;

            vm.error = null;

            vm.postOptions = postOptions;

            // Create new post

            vm.post = {};

            vm.create = function (isValid) {

                vm.error = null;

                // hard-coded because post.access dropdown menu is not an input element
                vm.post.access ? vm.accessError = null : vm.accessError = 'Please select an access option for your post.';

                if (!isValid) {
                    $scope.$broadcast('show-errors-check-validity', 'postForm');
                }

                else {

                    posts.create(vm.post).then(function (response) {
                        $state.go('posts.detail', {
                            postId: response._id
                        });
                    }, function (err) {
                        vm.error = err;
                    });
                }
            };

            vm.modal = function (data) {

                // array of IDS for model/datasets already selected from modal
                var selectedData = [];

                if (!vm.post.hasOwnProperty(data)) {
                    vm.post[data] = [];
                }

                else {
                    angular.forEach(vm.post[data], function (e) {
                        if (e._id) {
                            selectedData.push(e._id);
                        }
                    });
                }

                var controller = function ($scope, $modalInstance, Models, Datasets, Authentication) {

                    var vm = this;

                    vm.modal = true; // disables/enables modal features to reuse list view for models/datasets

                    //disables item selection if already selected
                    vm.selectedData = selectedData;

                    vm.user = Authentication.user;

                    vm.ok = function (data) {
                        //passes info back to parent controller
                        $modalInstance.close(data);
                    };

                    vm.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    if (data === 'models') {

                        Models.filter('user', Authentication.user._id)
                            .then(function (res) {
                                    vm.list = res.data;
                                },
                                function (error) {}).finally(function () {
                                vm.loading = false;
                                vm.resolved = true;
                            });
                    }
                    else if (data === 'datasets') {

                        Datasets.user(Authentication.user.username)
                            .then(function (res) {
                                    vm.list = res.data;
                                },
                                function (error) {}).finally(function () {
                                vm.loading = false;
                                vm.resolved = true;
                            });
                    }
                };

                var options = {
                    controller: controller
                };

                if (data === 'models') {
                    options.templateUrl = 'modules/models/client/views/list-models.client.view.html';
                    options.controllerAs = 'vm';
                }

                else if (data === 'datasets') {
                    options.templateUrl = 'modules/datasets/client/list/datasets.list.html';
                    options.controllerAs = 'DatasetsList';
                }
                else if (data === 'files') {
                    options.templateUrl = 'modules/posts/client/create/posts.modal.html';
                    options.controllerAs = 'vm';
                }

                $uibModal.open(options).result.then(function (selection) {
                    vm.post[data].push(selection);
                });

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

                vm.user.files.push(fileItem.file.name);
                // Clear upload buttons
                $scope.cancelUpload();

            };

            $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
                // Clear upload buttons
                $scope.cancelUpload();

                // Show error message
                vm.error = response.message;
            };

                }]);
