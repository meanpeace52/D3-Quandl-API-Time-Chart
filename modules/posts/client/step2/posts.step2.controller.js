'use strict';

//posts Step2 Controller
angular.module('posts')
    .controller('postsStep2Controller', ['$scope', '$state', '$stateParams', 'Authentication', 'posts', '$uibModal',
                '$window', '$timeout', 'FileUploader', 'postOptions', 'Models', 'Datasets', '$log', 'toastr',
                'ModelsService', 'modelOptions', 'prompt',
            function ($scope, $state, $stateParams, Authentication, posts, $uibModal, $window, $timeout, FileUploader,
                      postOptions, Models, Datasets, $log, toastr, ModelsService, modelOptions, prompt) {
            var vm = this;

            vm.user = Authentication.user;

            vm.submitted = false;

            vm.error = null;

            vm.postOptions = postOptions;

            vm.modelOptions = modelOptions;

            vm.newPost = $state.current.name === 'posts.createstep2';

            vm.activeTab = 'Datasets';

            vm.post = {
            };

            vm.back = function(){
                $state.go('posts.edit', {
                    postId: vm.post._id
                });
            };

            vm.get = function () {
                posts.crud.get({
                    postId: $stateParams.postId
                }).$promise.then(function (res) {
                    vm.post = res;

                    if (vm.post.files && vm.post.files.length){
                        _.each(vm.post.files, function(file){
                            var foundfile = _.find(vm.user.files, { _id : file._id });
                            if (foundfile){
                                vm.user.files = _.without(vm.user.files, foundfile);
                            }
                        });
                    }
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
                if (model.access !== 'private'){
                    if (!vm.post.models){
                        vm.post.models = [];
                    }

                    if (model.dataset.access !== model.access && model.dataset.cost !== model.cost) {
                        prompt({
                            title: 'Is that ok?',
                            message: 'The price and access for the dataset used for this model needs to be the same, so we\'ll change it to match?'
                        }).then(function(){
                            model.dataset.access = model.access;
                            model.dataset.cost = model.cost;
                            updateDataset(model.dataset);
                            updateModel(model, true);
                        });
                    }
                    else if (vm.model.dataset.access !== vm.model.access){
                        prompt({
                            title: 'Is that ok?',
                            message: 'The access for the dataset used for this model must also be changed to ' + vm.model.access + '?'
                        }).then(function(){
                            model.dataset.access = model.access;
                            updateDataset(vm.model.dataset);
                            updateModel(model, true);
                        });
                    }
                    else if (vm.model.dataset.cost !== vm.model.cost){
                        prompt({
                            title: 'Is that ok?',
                            message: 'The price for the dataset used for this model cannot be higher than the model, so we\'ll change it to match?'
                        }).then(function(){
                            vm.model.dataset.cost = vm.model.cost;
                            updateDataset(vm.model.dataset);
                            updateModel(model, true);
                        });
                    }
                    else{
                        updateModel(model, true);
                    }
                }
            };

            function updateModel(model, updateList){
                ModelsService.update(model)
                    .then(function(){

                    })
                    .catch(function(err){
                        $log.error(err);
                    });

                if (updateList){
                    vm.models = _.without(vm.models, model);
                    vm.model = undefined;
                    vm.post.models.push(model);
                }
            }

            vm.addDataset = function(dataset){
                if (dataset.access !== 'private'){
                    if (!vm.post.datasets){
                        vm.post.datasets = [];
                    }

                    if (vm.datasetmodel !== null){
                        if (dataset.access !== vm.datasetmodel.access && dataset.cost !== vm.datasetmodel.cost) {
                            prompt({
                                title: 'Is that ok?',
                                message: 'The price and access for the model built on this dataset needs to be the same, so we\'ll change it to match?'
                            }).then(function(){
                                vm.datasetmodel.access = dataset.access;
                                vm.datasetmodel.cost = dataset.cost;
                                updateDataset(dataset, true);
                                updateModel(vm.datasetmodel);
                            });
                        }
                        else if (vm.datasetmodel.access !== dataset.access){
                            prompt({
                                title: 'Is that ok?',
                                message: 'The access for the model built on this dataset must also be changed to ' + vm.dataset.access + '?'
                            }).then(function(){
                                vm.datasetmodel.access = dataset.access;
                                updateDataset(dataset, true);
                                updateModel(vm.datasetmodel);
                            });
                        }
                        else if (vm.datasetmodel.cost !== dataset.cost){
                            prompt({
                                title: 'Is that ok?',
                                message: 'You can\'t make a dataset more expensive to purchase than the model built on it, so we\'ll change it to match?'
                            }).then(function(){
                                vm.datasetmodel.cost = dataset.cost;
                                updateDataset(dataset, true);
                                updateModel(vm.datasetmodel);
                            });
                        }
                        else{
                            updateDataset(dataset, true);
                        }
                    }
                    else {
                        updateDataset(dataset, true);
                    }
                }
            };

            function updateDataset(dataset, updateList){
                Datasets.update(dataset)
                    .then(function(){

                    })
                    .catch(function(err){
                        $log.error(err);
                    });

                if (updateList){
                    vm.datasets = _.without(vm.datasets, dataset);
                    vm.dataset = undefined;
                    vm.post.datasets.push(dataset);
                }
            }

            vm.addExistingFile = function(existingFile){
                if (!vm.post.files){
                    vm.post.files = [];
                }
                vm.user.files = _.without(vm.user.files, existingFile);
                vm.post.files.push(existingFile);
            };

            vm.removeDataset = function(dataset){
                vm.post.datasets = _.without(vm.post.datasets, dataset);
                vm.datasets.push(dataset);
            };

            vm.removeModel = function(model){
                vm.post.models = _.without(vm.post.models, model);
                vm.models.push(model);
            };

            vm.removeFile = function(file){
                vm.post.files = _.without(vm.post.files, file);
                vm.user.files.push(file);
            };

            vm.changeDatasetAccess = function(dataset){
                if (dataset.access === 'for sale'){
                    if (!dataset.cost){
                        dataset.cost = 1;
                    }
                }
                else{
                    delete dataset.cost;
                }
            };

            vm.changeModelAccess = function(model){
                if (model.access === 'for sale'){
                    if (!model.cost){
                        model.cost = 1;
                    }
                }
                else{
                    delete model.cost;
                }
            };

            vm.datasetChange = function(dataset){
                ModelsService.findmodelbydataset(dataset._id)
                    .then(function(model){
                        vm.datasetmodel = model;
                    })
                    .catch(function(err){
                        $log.error(err);
                        toastr.error('Error loading model.');
                    });
            };

            // IMPORTANT : fileuploader must be kept on $scope because of bug with controllerAs
            $scope.uploader = new FileUploader({
                url: 'api/users/files'
            });

            $scope.uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
                toastr.error('Only files with the .pdf extension allowed.');
            };

            $scope.uploader.filters.push({
                name: 'pdfFilter',
                fn: function(item /*{File|FileLikeObject}*/, options) {
                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                    return '|pdf|'.indexOf(type) !== -1;
                }
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

            Datasets.user(Authentication.user.username)
                .then(function (res) {
                    vm.datasets = res.data;

                    if (vm.post.datasets && vm.post.datasets.length){
                        _.each(vm.post.datasets, function(dataset){
                            var founddataset = _.find(vm.datasets, { _id : dataset._id });
                            if (founddataset){
                                vm.datasets = _.without(vm.datasets, founddataset);
                            }
                        });
                    }
                },
                function (err) {
                    $log.error(err);
                    toastr.error('Please loading datasets.');
                });

            ModelsService.user(Authentication.user._id)
                .then(function (res) {
                    vm.models = res;

                    if (vm.post.models && vm.post.models.length){
                        _.each(vm.post.models, function(model){
                            var foundmodel = _.find(vm.models, { _id : model._id });
                            if (foundmodel){
                                vm.models = _.without(vm.models, foundmodel);
                            }
                        });
                    }
                },
                function (err) {
                    $log.error(err);
                    toastr.error('Please loading models.');
                });

    }]);
