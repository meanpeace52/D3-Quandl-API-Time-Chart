'use strict';

//posts Create Controller
angular.module('posts')
    .controller('postsCreateController', ['$scope', '$state', 'Authentication', 'posts', 'postOptions', '$uibModal', '$window', '$timeout', 'FileUploader',
            function ($scope, $state, Authentication, posts, postOptions, $uibModal, $window, $timeout, FileUploader) {

            var vm = this;

            vm.authentification = Authentication;

            vm.error = null;

            vm.postOptions = postOptions;

            // Create new post

            vm.models = ['test'];

            vm.create = function (isValid) {

                vm.error = null;

                if (!isValid) {
                    $scope.$broadcast('show-errors-check-validity', 'postForm');

                    return false;
                }

                posts.create(vm.post).then(function (response) {
                    $state.go('posts.detail', {
                        postId: response._id
                    });
                }, function (err) {
                    vm.error = err.message;
                });
            };

            vm.modal = function (data) {

                var options;

                if (data === 'models') {
                    options = {
                        templateUrl: 'modules/models/client/views/list-models.client.view.html',
                        controller: 'ModelsListController',
                        controllerAs: 'vm',
                        resolve: {
                            modalState: function () {
                                vm.modalState = 'models.search({username: vm.authentification.user._id}';
                            }
                        }
                    };
                }

                else if (data === 'datasets') {
                    options = {
                        templateUrl: 'modules/datasets/client/list/datasets.list.html',
                        controller: 'DatasetsListController',
                        controllerAs: 'DataSetsList',
                        resolve: {
                            modalState: function () {
                                vm.modalState = 'datasets.list({field: "username", value: vm.authentification.user._id})';
                            }
                        }
                    };
                }

                $uibModal.open(options).result.then(function (res) {
                    vm.post[data].push(data);
                });

            };

            // Create file uploader instance
            vm.uploader = new FileUploader({
                url: 'api/user/files',
            });

            // Called after the user selected a new picture file
            vm.uploader.onAfterAddingFile = function (fileItem) {
                if ($window.FileReader) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(fileItem._file);

                    fileReader.onload = function (fileReaderEvent) {
                        $timeout(function () {
                            vm.imageURL = fileReaderEvent.target.result;
                        }, 0);
                    };
                }
            };

            // Called after the user has successfully uploaded a new picture
            vm.uploader.onSuccessItem = function (fileItem, response, status, headers) {
                // Show success message
                vm.success = true;

                // Clear upload buttons
                vm.cancelUpload();
            };

            vm.uploader.onErrorItem = function (fileItem, response, status, headers) {
                // Clear upload buttons
                vm.cancelUpload();

                // Show error message
                vm.error = response.message;
            };

            vm.upload = function () {
                // Clear messages
                vm.success = vm.error = null;

                // Start upload
                vm.uploader.uploadAll();
            };

            // Cancel the upload process
            vm.cancelUpload = function () {
                vm.uploader.clearQueue();
            };

            }]);
