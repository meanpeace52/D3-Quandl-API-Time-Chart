'use strict';

//Datasets Detail Controller
angular.module('datasets')
    .controller('WorkbenchController',
        ['$stateParams', '$state', 'Datasets', 'UsersFactory', 'Authentication', 'DTOptionsBuilder', 'DTColumnDefBuilder',
            function ($stateParams, $state, Datasets, UsersFactory, Authentication, DTOptionsBuilder, DTColumnDefBuilder) {
                var vm = this;

				vm.authentication = Authentication;
				vm.user = Authentication.user;

                vm.ds1 = {
                    data: null, 
                    hasLoadedData: false,
                    tableOptions: null,
                    tableColumnDefs: [
                        DTColumnDefBuilder.newColumnDef(0)
                    ],
                    _id: $stateParams.ds1,
                };
				vm.ds2 = {
                    data: null, 
                    hasLoadedData: false,
                    tableOptions: null,
                    tableColumnDefs: null,
                    _id: $stateParams.ds2,
                };
				vm.usersDatasets = [];

                function getDataset(container) {
                    var vmContainer = vm[container];

                    if (vmContainer && vmContainer._id) {
                        vmContainer.hasLoadedData = false;
                        Datasets.crud.get({datasetId: vmContainer._id})
                            .$promise.then(function (dataset) {
                                vmContainer.data = dataset;
                                return dataset._id;
                            })
                            .then(Datasets.getDatasetWithS3.bind(Datasets))
                            .then(function (data) {
                                vmContainer.columns = data.columns;
                                vmContainer.rows = data.rows;
                                vmContainer.tableColumnDefs = _.map(data.columns, function (col, i) {
                                    return DTColumnDefBuilder.newColumnDef(i).withTitle(col);
                                });
                                vmContainer.tableOptions = DTOptionsBuilder.newOptions()
                                    .withPaginationType('simple')
                                    .withOption('scrollY', '450px')
                                    .withOption('scrollX', '100%');
                                vmContainer.hasLoadedData = true;
                            });
                    }
                }

                UsersFactory.finduserdatasets(vm.user).then(function (usersDatasets) {
                	vm.usersDatasets = usersDatasets;
                });

                getDataset('ds1');
                getDataset('ds2');

                vm.addtoUser = function () {
                    Datasets.addToUserApiCall(vm.viewingDataset);
                };

                vm.loadDataset = function (container) {
                    vm[container]._id = vm[container].data._id;
                    $state.go('datasets.workbench', {
                        ds1: vm.ds1._id,
                        ds2: vm.ds2._id,
                    }, {
                        location: 'replace',
                        reload: false,
                        notify: false
                    });
                    getDataset(container);
                };
            }]);
