'use strict';

//Posts Create Controller
angular.module('datasets')
    .controller('DatasetsCreateController',
        ['$scope', '$state', 'Authentication', 'Datasets', 'datasetOptions', '$log', 'toastr', 'FileUploader', '$window', '$timeout',
            function ($scope, $state, Authentication, Datasets, datasetOptions, $log, toastr, FileUploader, $window, $timeout) {
                var vm = this;

                vm.authentication = Authentication;

                vm.datasetOptions = datasetOptions;

                vm.submitted = false;

                vm.dataset = {
                    access : 'public'
                };

                // Create new Post
                vm.create = function (isValid) {
                    vm.error = null;
                    vm.submitted = true;

                    if (!isValid) {
                        $scope.$broadcast('show-errors-check-validity', 'datasetsForm');
                        return false;
                    }

                    if (!vm.dataset.filename || vm.dataset.filename === ''){
                        toastr.error('You need to upload a dataset .csv file first.');
                        return false;
                    }

                    // Redirect after save
                    Datasets.create(vm.dataset)
                        .then(function(dataset){
                            toastr.success('Dataset created successfully!');
                            $state.go('users.profilepage.datasets', { username : vm.authentication.user.username });
                        })
                        .catch(function(err){
                            $log.error(err);
                            toastr.error('Error creating dataset.');
                        });
                };

                // IMPORTANT : fileuploader must be kept on $scope because of bug with controllerAs
                $scope.uploader = new FileUploader({
                    url: '/api/datasets/upload'
                });

                $scope.uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
                    toastr.error('Only files with the .csv extension allowed.');
                };

                $scope.uploader.filters.push({
                    name: 'csvFilter',
                    fn: function(item /*{File|FileLikeObject}*/, options) {
                        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                        return '|csv|vnd.ms-excel|'.indexOf(type) !== -1;
                    }
                });

                // Called after the user selected a new picture file
                $scope.uploader.onAfterAddingFile = function (fileItem) {
                    if ($window.FileReader) {
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL(fileItem._file);
                        fileReader.onload = function (event) {
                            $timeout(function () {
                                var csvData = {
                                    name: fileItem.file.name,
                                    file: event.target.result
                                };
                                $scope.upload(csvData);
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
                    vm.dataset.s3reference = response._id;
                    vm.dataset.filename = response.name;
                    toastr.success(response.name + ' uploaded successfully.')

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
