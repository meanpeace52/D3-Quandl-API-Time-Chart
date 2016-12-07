'use strict';

angular.module('process')
    .controller('ModelModalController',
    ['$uibModalInstance', '$state', '$stateParams', '$q', 'Authentication', 'Datasets', 'ModelsService', 'tasks', 'results',
        'modelOptions', 'toastr', '$log', '$scope', 'processData',
        function ($uibModalInstance, $state, $stateParams, $q, Authentication, Datasets, ModelsService, tasks, results,
                  modelOptions, toastr, $log, $scope, processData) {
            var vm = this;

            vm.user = Authentication.user;
            vm.accessList = modelOptions.access;
            vm.processData = processData;

            vm.submitted = false;
            vm.datasetSubmitted = false;

            vm.model = null;
            vm.modeldataset = null;
            vm.dataset = null;
            vm.tasks = tasks;
            vm.saving = false;
            vm.tabs = ['Transformation Steps', 'R Code'];
            vm.access = 'public';
            vm.code = results.code;

            if (results.dataset) {
                vm.dataset = results.dataset;
                vm.dataset.access = 'public';
                vm.tabs.unshift('Dataset');
            }

            var finaltask = _.find(tasks, { endpoint : true });

            if (finaltask.returnType === 'model') {
                vm.model = {
                    type: finaltask.title,
                    equation: _.find(results.objects, {name: 'equation'}).value,
                    metrics: _.find(results.objects, {name: 'metrics'}).value,
                    output: results.console
                };
                vm.tabs.unshift('Model');
            }

            vm.activeTab = vm.tabs[0];

            vm.changeTab = function (tab) {
                vm.activeTab = tab;
            };

            vm.discard = function () {
                $uibModalInstance.dismiss();
            };

            vm.saveDataset = function(isValid){
                vm.datasetsubmitted = true;

                if (!isValid) {
                    $scope.$broadcast('show-errors-check-validity', 'datasetform');
                    toastr.error('Please fix all validation errors, before you can save.');
                    return false;
                }

                if (vm.user.plan === 'free'){
                    vm.dataset.access = 'public';
                }

                vm.dataset.datasetkey = results.datasetkey;

                Datasets.create(vm.dataset)
                    .then(function(dataset){
                        toastr.success('Dataset created successfully!');
                    })
                    .catch(function(err){
                        $log.error(err);
                        toastr.error(err.message);
                    });
            };

            vm.saveModel = function(isValid){
                vm.submitted = true;

                if (!isValid) {
                    $scope.$broadcast('show-errors-check-validity', 'form');
                    toastr.error('Please fix all validation errors, before you can save.');
                    return false;
                }

                if (vm.user.plan === 'free'){
                    vm.model.access = 'public';
                    vm.modeldataset.access = 'public';
                }
                else{
                    vm.model.access = vm.access;
                    vm.modeldataset.access = vm.access;
                }

                if (vm.access === 'for sale'){
                    vm.model.cost = vm.cost;
                    vm.modeldataset.cost = vm.cost;
                }

                vm.modeldataset.datasetkey = results.datasetkey;
                vm.model.modelkey = results.modelkey;

                Datasets.create(vm.modeldataset)
                    .then(function(dataset){
                        vm.model.dataset = dataset._id;
                        ModelsService.create(vm.model)
                            .then(function(){
                                toastr.success('Model and dataset saved successfully!');
                            })
                            .catch(function(err){
                                $log.error(err);
                                toastr.error(err.message);
                            });
                    })
                    .catch(function(err){
                        $log.error(err);
                        toastr.error(err.message);
                    });

            };

        }]);
