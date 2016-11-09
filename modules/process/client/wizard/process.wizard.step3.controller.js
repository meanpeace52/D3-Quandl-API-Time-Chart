'use strict';

angular.module('process')
    .controller('ProcessWizardStep3Controller',
    ['$state', '$stateParams', 'Authentication', 'toastr', '$log', 'UsersFactory', 'ProcessStateService', 'Datasets',
        function ($state, $stateParams, Authentication, toastr, $log, UsersFactory, ProcessStateService, Datasets) {
            var vm = this;

            vm.user = Authentication.user;

            var currentProcessData = ProcessStateService.currentProcessData();
            if (currentProcessData.step1selection === 'existing-model'){
                vm.tabs = ['Old Model Dataset', 'Search Data', 'Transform Steps'];

                UsersFactory.userData('models', vm.user.username)
                    .then(function (models) {
                        vm.usersModels = models;
                        if (ProcessStateService.currentProcessData().selectedmodel){
                            vm.selectedmodel = _.find(vm.usersModels, { _id : ProcessStateService.currentProcessData().selectedmodel });
                            vm.onModelChange(vm.selectedmodel);
                        }
                    });
            }
            else{
                vm.tabs = ['Search Data', 'Transform Steps'];
            }

            vm.activeTab = vm.tabs[0];

            vm.currentdataset = {};

            vm.currentmodeldataset = {};

            vm.showLoader = false;

            vm.showModelLoader = false;

            vm.transformSteps = [];

            vm.changeTab = function(tab){
                vm.activeTab = tab;
            };

            UsersFactory.userData('datasets', vm.user.username)
                .then(function (datasets) {
                    vm.usersDatasets = datasets;
                    if (ProcessStateService.currentProcessData().selecteddataset){
                        vm.selecteddataset = _.find(vm.usersDatasets, { _id : ProcessStateService.currentProcessData().selecteddataset });
                        vm.onDatasetChange(vm.selecteddataset);
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
                        vm.currentdataset.renamedcolumns = data.columns;
                        vm.excludedcolumns = _.reduce(vm.currentdataset.columns, function(hash, value) {
                            var key = value;
                            hash[key] = false;
                            return hash;
                        }, {});
                        vm.keyfield = vm.currentdataset.columns[0];
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
                        vm.availablemodelcolumns = data.columns;
                        vm.currentmodeldataset.renamedcolumnnames = data.columns;
                        vm.currentmodeldataset.renamedcolumns = _.reduce(vm.currentmodeldataset.columns, function(hash, value) {
                            var key = value;
                            hash[key] = key;
                            return hash;
                        }, {});
                        vm.selectedmodelcolumns = _.reduce(vm.currentmodeldataset.columns, function(hash, value) {
                            var key = value;
                            hash[key] = true;
                            return hash;
                        }, {});
                        vm.modelkeyfield = vm.currentmodeldataset.columns[0];
                        vm.currentmodeldataset.rows = _.take(data.rows, 10);
                    });
            };

            vm.selectModelColumnsAll = function(){
                _.forOwn(vm.selectedmodelcolumns, function(value, key) {
                    vm.selectedmodelcolumns[key] = true;
                });
                vm.modelColumnsChanged();
            };

            vm.unselectModelColumnsAll = function(){
                _.forOwn(vm.selectedmodelcolumns, function(value, key) {
                    vm.selectedmodelcolumns[key] = false;
                });
                vm.modelColumnsChanged();
            };

            vm.addOldModelTransformStep = function(){
                var transformStep = {  };
                transformStep.model = vm.selectedmodel;
                transformStep.keyfield = vm.modelkeyfield;

                var selectedcolumns = [];
                var renamedcolumns = [];
                var i = 0;

                _.forOwn(vm.selectedmodelcolumns, function(value, key) {
                    if (value){
                        selectedcolumns.push(key);
                        renamedcolumns.push(vm.currentmodeldataset.renamedcolumns[key]);
                    }
                    i++;
                });

                transformStep.selectedcolumns = selectedcolumns;
                transformStep.renamedcolumns = renamedcolumns;
                transformStep.type = 'modeldataset';

                vm.transformSteps.push(transformStep);
                toastr.success('Transform step added successfully.');
            };

            vm.modelColumnsChanged = function(){
                vm.availablemodelcolumns = [];
                _.forOwn(vm.selectedmodelcolumns, function(value, key) {
                    if (value){
                        vm.availablemodelcolumns.push(key);
                    }
                });
                if (vm.availablemodelcolumns.length){
                    vm.modelkeyfield = vm.availablemodelcolumns[0];
                }
            };


        }]);
