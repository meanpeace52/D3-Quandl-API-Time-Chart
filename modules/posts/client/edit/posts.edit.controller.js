'use strict';

//posts Edit Controller
angular.module('posts')
    .controller('postsEditController', ['$scope', '$state', '$stateParams', 'Authentication', 'posts', '$uibModal', '$window', '$timeout', 'FileUploader','postOptions',
            function ($scope, $state, $stateParams, Authentication, posts, $uibModal, $window, $timeout, FileUploader, postOptions) {
            var vm = this;

            vm.authentication = Authentication;

            vm.post = posts.crud.get({
                postId: $stateParams.postId
            });

            vm.postOptions = postOptions;

            vm.update = function () {

                vm.post.$update(function () {
                    $state.go('posts.detail', {
                        postId: vm.post._id
                    });
                }, function (errorResponse) {
                    vm.error = errorResponse.data.message;
                });
            };


            vm.modal = function (data) {

                if (!vm.post.hasOwnProperty(data)) {
                    vm.post[data] = [];
                }

                // array of IDS for model/datasets already selected from modal
                var selectedData = vm.post[data].map(function (data) {
                    return data._id;
                });

                var controller = function ($scope, $modalInstance, Models, Datasets, Authentication) {

                    var vm = this;

                    vm.modal = true; // disables/enables modal features to reuse list view for models/datasets

                    //disables item selection if already selected
                    vm.selectedData = selectedData;

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
                                    vm.loadingResults = false;
                                    vm.models = res.data;
                                },
                                function (error) {
                                    vm.loadingResults = false;
                                });
                    }
                    else if (data === 'datasets') {

                        Datasets.user(Authentication.user.username)
                            .then(function (res) {
                                    vm.list = res.data;
                                    vm.loadingResults = false;
                                },
                                function (error) {
                                    vm.loadingResults = false;
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

                $uibModal.open(options).result.then(function (selection) {
                    vm.post[data].push(selection);
                });

            }

            vm.pdfs = [];

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

                vm.pdfs.push(file);

            };

            // Called after the user has successfully uploaded a new picture
            $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
                // Show success message
                vm.success = true;

                // Clear upload buttons
                vm.cancelUpload();
            };

            $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
                // Clear upload buttons
                $scope.cancelUpload();

                // Show error message
                vm.error = response.message;
            };


            // Cancel the upload process
            $scope.cancelUpload = function () {
                $scope.uploader.clearQueue();
            };


            }]);
