'use strict';

//Datasets Detail Controller
angular.module('datasets')
    .controller('DatasetsEditController',
        ['$stateParams', 'Datasets', 'UsersFactory', 'Authentication',
            function ($stateParams, Datasets, UsersFactory, Authentication) {
                var vm = this;

				vm.authentication = Authentication;
				vm.user = Authentication.user;

				vm.viewingDataset = {};
				vm.usersDatasets = [];
				vm.columns = [];
				vm.rows = [];
				vm.hasLoadedData = false;

                UsersFactory.userData('datasets', vm.user).then(function (usersDatasets) {
                	vm.usersDatasets = usersDatasets;
                });

                Datasets.crud.get({datasetId: $stateParams.datasetId})
                	.$promise.then(function (dataset) {
	                	vm.viewingDataset = dataset;
	                	return dataset._id;
            		})
					.then(Datasets.getDatasetWithS3.bind(Datasets))
                	.then(function (data) {
						vm.columns = data.columns;
						vm.rows = data.rows;
						vm.hasLoadedData = true;
					});

                vm.addtoUser = function () {
                    Datasets.addToUserApiCall(vm.viewingDataset);
                };

                vm.mergeDataset = function () {
                    if (_.has(vm, 'selectedDatasetOption') && _.has(vm.selectedDatasetOption, '_id')) {
                        vm.hasLoadedData = false;
                        Datasets.getDatasetWithS3(vm.selectedDatasetOption._id).then(function (data) {
                            vm.selectedDatasetColumns = data.columns;
                            vm.selectedDatasetRows = data.rows;
                            vm.hasLoadedData = true;
                        });
                    } else {
                        alert('select a valid dataset');
                    }
                };
            }]);
