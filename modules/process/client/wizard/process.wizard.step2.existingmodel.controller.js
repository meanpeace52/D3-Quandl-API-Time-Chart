'use strict';

angular.module('process')
    .controller('ProcessWizardStep2ExistingModelController',
    ['$state', '$scope', '$stateParams', 'Authentication', 'toastr', '$log', 'Datasets', 'UsersFactory', 'ProcessStateService',
        function ($state, $scope, $stateParams, Authentication, toastr, $log, Datasets, UsersFactory, ProcessStateService) {
            var vm = this;

            vm.showLoader = false;
            vm.showModelLoader = false;
            vm.currentdataset = [];
            vm.currentmodeldataset = [];
            vm.user = Authentication.user;

            UsersFactory.userData('datasets', vm.user.username)
                .then(function (datasets) {
                    vm.usersDatasets = datasets;
                    if (ProcessStateService.currentProcessData().selecteddataset){
                        vm.selecteddataset = _.find(vm.usersDatasets, { _id : ProcessStateService.currentProcessData().selecteddataset });
                        vm.onDatasetChange(vm.selecteddataset);
                    }
                });

            UsersFactory.userData('models', vm.user.username)
                .then(function (models) {
                    vm.usersModels = models;
                    if (ProcessStateService.currentProcessData().selectedmodel){
                        vm.selectedmodel = _.find(vm.usersModels, { _id : ProcessStateService.currentProcessData().selectedmodel });
                        vm.onModelChange(vm.selectedmodel);
                    }
                });

            vm.onDatasetChange = function (dataset) {
                // re-initialize table data
                vm.currentdataset.rows = [];
                vm.currentdataset.columns = [];
                vm.showLoader = true;

                Datasets.getDatasetWithS3(dataset._id)
                    .then(function (data) {
                        vm.showLoader = false;
                        vm.currentdataset.columns = data.columns;
                        vm.currentdataset.rows = _.take(data.rows, 10);
                    });
            };

            vm.onModelChange = function (model) {
                // re-initialize table data
                vm.currentmodeldataset.rows = [];
                vm.currentmodeldataset.columns = [];
                vm.showModelLoader = true;

                Datasets.getDatasetWithS3(model.dataset)
                    .then(function (data) {
                        vm.showModelLoader = false;
                        vm.currentmodeldataset.columns = data.columns;
                        vm.currentmodeldataset.rows = _.take(data.rows, 10);
                    });
            };

            vm.saveSelection = function(model, dataset){

                if (!model){
                    toastr.error('Please select a model.');
                    return;
                }
                if (!dataset){
                    toastr.error('Please select a new dataset.');
                    return;
                }

                var processData = ProcessStateService.currentProcessData();
                processData.selectedmodel = model._id;
                processData.selecteddataset = dataset._id;
                processData.step1selection = 'existing-model';
                ProcessStateService.saveProcessData(processData);
                $scope.$emit('changeState', 'lab.process2.step3');
            };

        }]);
