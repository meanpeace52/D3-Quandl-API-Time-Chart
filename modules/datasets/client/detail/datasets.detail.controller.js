'use strict';

/* global moment */

//Datasets Detail Controller
angular.module('datasets')
    .controller('DatasetsDetailController',
        ['$stateParams', 'Datasets', 'toastr', '$log', 'Authentication', '$uibModal',
            function ($stateParams, Datasets, toastr, $log, Authentication, $uibModal) {
                var vm = this;
                vm.authentication = Authentication;
                vm.user = vm.authentication.user;
                vm.columns = [];
                vm.rows = [];
                vm.origRows = [];
                vm.hasLoadedData = false;
                vm.totalItems = 0;
                vm.currentPage = 1;
                vm.itemsPerPage = 50;
                vm.pageChanged = function(){
                    vm.rows = _.chain(vm.origRows)
                        .slice(vm.itemsPerPage * (vm.currentPage - 1))
                        .take(vm.itemsPerPage)
                        .value();
                };

                Datasets.crud.get({datasetId: $stateParams.datasetId})
                    .$promise.then(function (dataset) {
                        vm.dataset = dataset;

                        //vm.dataset.hasheader = false;
                        if (!vm.dataset.hasheader){
                        }
                    });

                Datasets.getDatasetWithS3($stateParams.datasetId)
                    .then(function (data) {
                        vm.columns = data.columns;
                        vm.origRows = data.rows;
                        vm.totalItems = vm.origRows.length;
                        vm.rows = _.take(vm.origRows, vm.itemsPerPage);
                        vm.hasLoadedData = true;
                    });

                vm.addtoUser = function () {
                    Datasets.showTitleModal(vm.dataset.title + ' - ' + moment().format('MM/DD/YYYY, h:mm:ss a'), function(result){
                        vm.dataset.title = result.title;
                        Datasets.addToUserApiCall(vm.dataset)
                            .then(function (dataset) {
                                toastr.success('Dataset copied to your page.');
                            })
                            .catch(function (err) {
                                $log.error(err);
                                toastr.error('An error occurred while copying the dataset.');
                            });
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

