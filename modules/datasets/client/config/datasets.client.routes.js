'use strict';

// Setting up route
angular.module('datasets')
    .config(['$stateProvider',
        function ($stateProvider) {
            var MODULE_PATH = 'modules/datasets/client/';

            // datasets state routing
            $stateProvider
                .state('datasets', {
                    abstract: true,
                    url: '/datasets',
                    template: '<ui-view/>'
                })
                .state('datasets.list', {
                    url: '',
                    controller: 'DatasetsListController',
                    controllerAs: 'DatasetsList',
                    templateUrl: MODULE_PATH + 'list/datasets.list.html'
                })
                .state('datasets.create', {
                    url: '/create',
                    controller: 'DatasetsCreateController',
                    controllerAs: 'DatasetsCreate',
                    templateUrl: MODULE_PATH + 'create/datasets.create.html',
                    data: {
                        roles: ['user', 'admin']
                    }
                })
                .state('datasets.workbench', {
                    url: '/workbench/:ds1/:ds2',
                    controller: 'WorkbenchController',
                    controllerAs: 'Workbench',
                    templateUrl: MODULE_PATH + 'workbench/datasets.workbench.html',
                    params: {
                        ds1: {
                            squash: true,
                            value: null
                        },
                        ds2: {
                            squash: true,
                            value: null
                        },
                    }
                })
                .state('datasets.detail', {
                    url: '/:datasetId',
                    controller: 'DatasetsDetailController',
                    controllerAs: 'DatasetsDetail',
                    templateUrl: MODULE_PATH + 'detail/datasets.detail.html'
                })
                .state('datasets.edit', {
                    url: '/:datasetId/edit',
                    controller: 'DatasetsEditController',
                    controllerAs: 'DatasetsEdit',
                    templateUrl: MODULE_PATH + 'edit/datasets.edit.html',
                    data: {
                        roles: ['user', 'admin']
                    }
                });
        }
    ]);
