'use strict';

angular.module('process')
    .controller('ProcessWizardStep2NewModelController',
    ['$state', '$scope', '$stateParams', 'Authentication', 'toastr', '$log', 'Datasets', 'UsersFactory', 'ProcessStateService',
        function ($state, $scope, $stateParams, Authentication, toastr, $log, Datasets, UsersFactory, ProcessStateService) {
            var vm = this;

            vm.showLoader = false;
            vm.currentdataset = [];
            vm.user = Authentication.user;


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
                        vm.currentdataset.rows = _.take(data.rows, 10);
                    });
            };

            vm.saveSelection = function(event, dataset){
                if (!dataset){
                    toastr.error('Please select a new dataset.');
                    return;
                }

                ProcessStateService.currentProcessData().selecteddataset = dataset._id;
                ProcessStateService.saveProcessData();
                $scope.$emit('changeState', 'lab.process2.step3');
            };

        }]);
