'use strict';

angular.module('process')
    .controller('ProcessWizardStep3Controller',
    ['$state', '$stateParams', 'Authentication', 'toastr', '$log', 'UsersFactory', 'ProcessStateService', 'Datasets', 'prompt', '$rootScope', 'Tasks', 'Process', '$localStorage',
        function ($state, $stateParams, Authentication, toastr, $log, UsersFactory, ProcessStateService, Datasets, prompt, $rootScope, Tasks, Process, $localStorage) {
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


            vm.process = ProcessStateService.currentProcessTasksData();

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

            vm.tasks = Tasks.getTasks();

            vm.changeTab = function(tab){
                vm.activeTab = tab;
            };

            vm.loadedSavedWorkflow = $localStorage.savedWorkflow && $localStorage.savedWorkflow === true;

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
                        ProcessStateService.setSelectedDataset({
                            columns : data.columns
                        });
                        vm.currentdataset.columns = data.columns;
                        vm.availablecolumns = data.columns;
                        vm.currentdataset.renamedcolumns = _.reduce(data.columns, function(hash, value) {
                            var key = value;
                            hash[key] = key;
                            return hash;
                        }, {});
                        vm.currentdataset.renamedcolumnnames = data.columns;
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

                Datasets.get(model.dataset)
                    .then(function(dataset){
                        vm.currentmodeldataset.datasets3reference = dataset.s3reference;
                    });

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
                transformStep.keyfieldindex = vm.currentmodeldataset.columns.indexOf(transformStep.keyfield) + 1;

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

                transformStep.dropcolumns = [];
                var colindex = 1;
                _.each(vm.currentmodeldataset.columns, function(column){
                    if (!_.contains(transformStep.selectedcolumns, column)){
                        transformStep.dropcolumns.push(colindex);
                    }
                    colindex++;
                });

                transformStep.datasets3reference = vm.currentmodeldataset.datasets3reference;
                transformStep.renamedcolumns = renamedcolumns;
                transformStep.type = 'merge';
                transformStep.source = 'modeldataset';
                transformStep.destinationkeyfield = vm.keyfield;
                transformStep.destinationkeyfieldindex = vm.availablecolumns.indexOf(vm.keyfield) + 1;

                vm.transformSteps.push(transformStep);
                ProcessStateService.saveTransformSteps(vm.transformSteps);
                toastr.success('Transform step added successfully.');
            };

            vm.addDatasetTransformStep = function(){
                var transformStep = { };
                transformStep.dataset = vm.selectedcomparitivedataset;
                transformStep.keyfield = vm.comparitivedatasetkeyfield;
                transformStep.keyfieldindex = vm.currentselecteddataset.columns.indexOf(transformStep.keyfield) + 1;

                var selectedcolumns = [];
                var renamedcolumns = [];
                var i = 0;

                _.forOwn(vm.selecteddatasetcolumns, function(value, key) {
                    if (value){
                        selectedcolumns.push(key);
                    }
                    renamedcolumns.push(vm.currentselecteddataset.renamedcolumns[key]);
                    i++;
                });

                transformStep.selectedcolumns = selectedcolumns;

                var colindex = 1;
                transformStep.dropcolumns = [];
                _.each(vm.currentselecteddataset.columns, function(column){
                    if (!_.contains(transformStep.selectedcolumns, column)){
                        transformStep.dropcolumns.push(colindex);
                    }
                    colindex++;
                });
                transformStep.renamedcolumns = renamedcolumns;
                transformStep.destinationkeyfield = vm.keyfield;
                transformStep.destinationkeyfieldindex = vm.availablecolumns.indexOf(vm.keyfield) + 1;
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


            vm.dropColumns = function(){
                vm.transformSteps = _.filter(vm.transformSteps, function(step){
                    return step.type !== 'drop';
                });

                var columnsToBeDropped = [];
                var columnIndexes = [];
                _.forOwn(vm.excludedcolumns, function(value, key) {
                    if (value){
                        columnsToBeDropped.push(key);
                        columnIndexes.push(vm.availablecolumns.indexOf(key));
                    }
                });

                if (columnsToBeDropped.length > 0){
                    var transformStep = { };
                    transformStep.type = 'drop';
                    transformStep.columnnames = columnsToBeDropped;
                    transformStep.columnindexes = columnIndexes;
                    vm.transformSteps.push(transformStep);

                    ProcessStateService.saveTransformSteps(vm.transformSteps);
                    toastr.success('Transform step updated successfully.');
                }
                else{
                    toastr.error('No columns were marked to be dropped.');
                }
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

            vm.saveProcess = function(){
                var process = _.clone(vm.process);

                if (process.title === ''){
                    toastr.error('Please provide a workflow title.');
                    return;
                }
                process.dataset = ProcessStateService.currentProcessData().selecteddataset;
                process.type= ProcessStateService.currentProcessData().step1selection;
                if (ProcessStateService.currentProcessData().selectedmodel){
                    process.model = ProcessStateService.currentProcessData().selectedmodel;
                }

                if (process._id) {
                    Process.update(process)
                        .then(function (process) {
                            toastr.success('Process updated successfully!');
                        })
                        .catch(function(err){
                            $log.error(err);
                            toastr.error(err.message);
                        });
                } else {
                    Process.create(process)
                        .then(function (process) {
                            vm.process._id = process._id;
                            ProcessStateService.saveProcessTasksData(vm.process);
                            toastr.success('Process created successfully!');
                        })
                        .catch(function(err){
                            $log.error(err);
                            toastr.error(err.message);
                        });
                }
            };

            vm.updateTransformProcessTask = function(){
                var currentProcessTasksData = ProcessStateService.currentProcessTasksData();
                var existingTask = _.find(currentProcessTasksData.tasks, {title: 'Initial Transformations'});
                if (vm.transformSteps.length){
                    if (!existingTask) {
                        var taskDetail = _.find(vm.tasks, {title: 'Initial Transformations'});
                        taskDetail.subtasks[0].options = {
                            transformSteps: vm.transformSteps
                        };
                        currentProcessTasksData.tasks.unshift(taskDetail.subtasks[0]);
                    }
                    else{
                        existingTask.options.transformSteps = vm.transformSteps;
                    }
                }
                else{
                    if (existingTask) {
                        currentProcessTasksData.tasks = _.without(currentProcessTasksData.tasks, existingTask);
                    }
                }
                ProcessStateService.saveProcessTasksData(currentProcessTasksData);
            };

            vm.addTransformStep = function(action){
                switch(action){
                    case 'Rename Columns':
                        vm.renameColumnNames();
                        break;
                    case 'Drop Selected Columns':
                        vm.dropColumns();
                        break;
                }
            };

            vm.renameColumnNames = function(){
                var different = false;
                _.forOwn(vm.currentdataset.renamedcolumns, function(value, key) {
                    if (value !== key){
                        different = true;
                    }
                });

                if (!different){
                    toastr.error('No columns has been renamed!');
                }
                else{
                    vm.transformSteps = _.filter(vm.transformSteps, function(step){
                        return step.type !== 'rename';
                    });
                    var renamedColumnNames = [];
                    _.forOwn(vm.currentdataset.renamedcolumns, function(value, key) {
                        if (value){
                            renamedColumnNames.push(value);
                        }
                    });

                    if (hasDuplicates(renamedColumnNames)){
                        toastr.error('Not all your columns have unique names!');
                        return;
                    }

                    var transformStep = { };
                    transformStep.type = 'rename';
                    transformStep.newcolumnnames = renamedColumnNames;
                    vm.transformSteps.push(transformStep);

                    ProcessStateService.saveTransformSteps(vm.transformSteps);
                    toastr.success('Transform step updated successfully.');
                }
            };

            function hasDuplicates(a) {
                return _.uniq(a).length !== a.length;
            }


            $rootScope.$on('useDataset', function(event, dataset){
                vm.showDatasetSearch = false;
                vm.selectedcomparitivedataset = dataset;
                vm.onComparitiveDatasetChange(dataset);
            });
        }]);
