'use strict';

//Datasets Detail Controller
angular.module('datasets')
    .controller('DatasetsDetailModalController',
        ['$modalInstance', 'Datasets', 'viewingDataset', 'toastr', '$log', 'Authentication',
            function ($modalInstance, Datasets, viewingDataset, toastr, $log, Authentication) {
                var vm = this;
                vm.viewingDataset = viewingDataset;
                vm.authentication = Authentication;
                vm.columns = [];
                vm.rows = [];
                vm.hasLoadedData = false;

                Datasets.getDatasetWithS3(viewingDataset._id).then(function (data) {
                    vm.columns = data.columns;
                    vm.rows = data.rows;
                    vm.hasLoadedData = true;
                });

                vm.ok = function () {
                    $modalInstance.close(true);
                };

                vm.cancel = function () {
                    $modalInstance.dismiss(false);
                };

                vm.addtoUser = function () {
                    Datasets.addToUserApiCall(viewingDataset)
                        .then(function (dataset) {
                            $modalInstance.close(true);
                            toastr.success('Dataset copied to your LAB.');
                        })
                        .catch(function (err) {
                            $log.error(err);
                            toastr.error('An error occurred while copying the dataset.');
                        });
                };

                vm.mergeDataset = function () {
                    if (_.has(vm, 'selectedDatasetOption') && _.has(vm.selectedDatasetOption, '_id')) {
                        vm.hasLoadedData = false;
                        Datasets.getDatasetWithS3(vm.selectedDatasetOption._id).then(function (data) {
                            vm.selectedDatasetColumns = data.columns;
                            vm.selectedDatasetRows = data.rows;
                            console.log(vm.selectedDatasetRows, vm.selectedDatasetColumns);
                            vm.hasLoadedData = true;
                        });
                    } else {
                        alert('select a valid dataset');
                    }
                };
            }]);
