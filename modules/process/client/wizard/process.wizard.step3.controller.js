'use strict';

angular.module('process')
    .controller('ProcessWizardStep3Controller',
    ['$state', '$stateParams', 'Authentication', 'toastr', '$log', 'UsersFactory', 'ProcessStateService', 'Datasets', 'prompt', '$rootScope',
        function ($state, $stateParams, Authentication, toastr, $log, UsersFactory, ProcessStateService, Datasets, prompt, $rootScope) {
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

            vm.currentselecteddataset = {};

            vm.selectedcomparitivedataset = {};

            vm.showLoader = false;

            vm.showModelLoader = false;

            vm.showDatasetLoader = false;

            vm.transformSteps = [];

            vm.showDatasetSearch = true;

            vm.changeTab = function(tab){
                vm.activeTab = tab;
            };

            ProcessStateService.loadTransformSteps();
            vm.transformSteps = ProcessStateService.currentTransformSteps();

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
                        vm.availablecolumns = data.columns;
                        vm.currentdataset.renamedcolumns = data.columns;
                        vm.excludedcolumns = _.reduce(vm.currentdataset.columns, function(hash, value) {
                            var key = value;
                            hash[key] = false;
                            return hash;
                        }, {});
                        var dropcolumns = _.filter(vm.transformSteps, { type : 'drop' });
                        _.each(dropcolumns, function(column){
                            vm.excludedcolumns[column.columnname] = true;
                        });
                        vm.keyfield = vm.currentdataset.columns[0];
                        vm.currentdataset.rows = _.take(data.rows, 10);
                    });
            };

            vm.onComparitiveDatasetChange = function (dataset) {
                // re-initialize table data
                vm.currentselecteddataset.rows = [];
                vm.currentselecteddataset.columns = [];
                vm.showDatasetLoader = true;

                Datasets.getDatasetWithS3(dataset._id)
                    .then(function (data) {
                        vm.showDatasetLoader = false;
                        vm.currentselecteddataset.columns = data.columns;
                        vm.currentselecteddataset.renamedcolumns = data.columns;
                        vm.availablecomparitivedatasetcolumns = data.columns;
                        vm.currentselecteddataset.renamedcolumnnames = data.columns;
                        vm.currentselecteddataset.renamedcolumns = _.reduce(vm.currentselecteddataset.columns, function(hash, value) {
                            var key = value;
                            hash[key] = key;
                            return hash;
                        }, {});
                        vm.selecteddatasetcolumns = _.reduce(vm.currentselecteddataset.columns, function(hash, value) {
                            var key = value;
                            hash[key] = true;
                            return hash;
                        }, {});
                        vm.comparitivedatasetkeyfield = vm.currentdataset.columns[0];
                        vm.currentselecteddataset.rows = _.take(data.rows, 10);
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

            vm.selectDatasetColumnsAll = function(){
                _.forOwn(vm.selecteddatasetcolumns, function(value, key) {
                    vm.selecteddatasetcolumns[key] = true;
                });
                vm.datasetColumnsChanged();
            };

            vm.unselectDatasetColumnsAll = function(){
                _.forOwn(vm.selecteddatasetcolumns, function(value, key) {
                    vm.selecteddatasetcolumns[key] = false;
                });
                vm.datasetColumnsChanged();
            };

            vm.addOldModelTransformStep = function(){
                var transformStep = { };
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
                transformStep.type = 'merge';
                transformStep.source = 'modeldataset';
                transformStep.destinationkeyfield = vm.keyfield;

                vm.transformSteps.push(transformStep);
                ProcessStateService.saveTransformSteps(vm.transformSteps);
                toastr.success('Transform step added successfully.');
            };

            vm.addDatasetTransformStep = function(){
                var transformStep = { };
                transformStep.dataset = vm.selectedcomparitivedataset;
                transformStep.keyfield = vm.comparitivedatasetkeyfield;

                var selectedcolumns = [];
                var renamedcolumns = [];
                var i = 0;

                _.forOwn(vm.selecteddatasetcolumns, function(value, key) {
                    if (value){
                        selectedcolumns.push(key);
                        renamedcolumns.push(vm.currentmodeldataset.renamedcolumns[key]);
                    }
                    i++;
                });

                transformStep.selectedcolumns = selectedcolumns;
                transformStep.renamedcolumns = renamedcolumns;
                transformStep.destinationkeyfield = vm.keyfield;
                transformStep.type = 'merge';
                transformStep.source = 'dataset';

                vm.transformSteps.push(transformStep);
                ProcessStateService.saveTransformSteps(vm.transformSteps);
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

            vm.datasetColumnsChanged = function(){
                vm.availablecomparitivedatasetcolumns = [];
                _.forOwn(vm.selecteddatasetcolumns, function(value, key) {
                    if (value){
                        vm.availablecomparitivedatasetcolumns.push(key);
                    }
                });
                if (vm.availablecomparitivedatasetcolumns.length){
                    vm.comparitivedatasetkeyfield = vm.availablecomparitivedatasetcolumns[0];
                }
            };


            vm.finalDatasetColumnsChanged = function(){
                vm.transformSteps = _.filter(vm.transformSteps, function(step){
                    return step.type !== 'drop';
                });
                _.forOwn(vm.excludedcolumns, function(value, key) {
                    if (value){
                        var transformStep = { };
                        transformStep.type = 'drop';
                        transformStep.columnname = key;
                        vm.transformSteps.push(transformStep);
                    }
                });
                ProcessStateService.saveTransformSteps(vm.transformSteps);
                toastr.success('Transform step updated successfully.');
            };

            vm.removeStep = function(step){
                prompt({
                    title: 'Confirm Delete?',
                    message: 'Are you sure you want to delete this transformation step?'
                }).then(function() {
                    vm.transformSteps = _.without(vm.transformSteps, step);
                    if (step.type === 'drop'){
                        vm.excludedcolumns[step.columnname] = false;
                    }
                    ProcessStateService.saveTransformSteps(vm.transformSteps);
                    toastr.success('Step removed successfully!');
                });
            };


            $rootScope.$on('useDataset', function(event, dataset){
                vm.showDatasetSearch = false;
                vm.selectedcomparitivedataset = dataset;
                vm.onComparitiveDatasetChange(dataset);
            });
        }]);
