'use strict';

//Datasets Detail Controller
angular.module('datasets')
    .controller('DatasetsEditController',
        ['$stateParams', 'Datasets', 'UsersFactory', 'Authentication', 'datasetOptions', 'toastr', '$log', '$state', '$scope', 'ModelsService', 'prompt',
            function ($stateParams, Datasets, UsersFactory, Authentication, datasetOptions, toastr, $log, $state, $scope, ModelsService, prompt) {
                var vm = this;

				vm.authentication = Authentication;
				vm.user = Authentication.user;
                vm.datasetOptions = datasetOptions;

                Datasets.crud.get({datasetId: $stateParams.datasetId})
                	.$promise.then(function (dataset) {
	                	vm.dataset = dataset;
                        if (vm.user._id !== vm.dataset.user._id){
                            toastr.error('You do not have access to edit this dataset.');
                            $state.go('users.profilepage.datasets', { username : vm.user.username });
                        }
            		});

                ModelsService.findmodelbydataset($stateParams.datasetId)
                    .then(function(model){
                        vm.model = model;
                    })
                    .catch(function(err){
                        $log.error(err);
                        toastr.error('Error loading model.');
                    });

                function updateDataset(){
                    // Redirect after save
                    Datasets.update(vm.dataset)
                        .then(function(dataset){
                            toastr.success('Dataset update successfully!');
                            $state.go('users.profilepage.datasets', { username : vm.authentication.user.username });
                        })
                        .catch(function(err){
                            $log.error(err);
                            toastr.error('Error creating dataset.');
                        });
                }

                function updateModel(){
                    // Redirect after save
                    ModelsService.update(vm.model);
                }

                vm.update = function (isValid) {
                    vm.error = null;
                    vm.submitted = true;

                    if (!isValid) {
                        $scope.$broadcast('show-errors-check-validity', 'datasetsForm');
                        return false;
                    }

                    // Check if there is model that is linked to the dataset, that it has the same access and cost as
                    // the dataset
                    if (vm.model !== null){
                        if (vm.dataset.access !== vm.model.access && vm.dataset.cost !== vm.model.cost) {
                            prompt({
                                title: 'Is that ok?',
                                message: 'The price and access for the model built on this dataset needs to be the same, so we\'ll change it to match?'
                            }).then(function(){
                                vm.model.access = vm.dataset.access;
                                vm.model.cost = vm.dataset.cost;
                                updateDataset();
                                updateModel();
                            });
                        }
                        else if (vm.model.access !== vm.dataset.access){
                            prompt({
                                title: 'Is that ok?',
                                message: 'The access for the model built on this dataset must also be changed to ' + vm.dataset.access + '?'
                            }).then(function(){
                                vm.model.access = vm.dataset.access;
                                updateDataset();
                                updateModel();
                            });
                        }
                        else if (vm.model.cost !== vm.dataset.cost){
                            prompt({
                                title: 'Is that ok?',
                                message: 'You can\'t make a dataset more expensive to purchase than the model built on it, so we\'ll change it to match?'
                            }).then(function(){
                                vm.model.cost = vm.dataset.cost;
                                updateDataset();
                                updateModel();
                            });
                        }
                        else{
                            updateDataset();
                        }
                    }
                    else {
                        updateDataset();
                    }
                };
    }]);
