'use strict';

// Setting up route
angular.module('process')
    .config(['$stateProvider',
        function ($stateProvider) {
            var MODULE_PATH = 'modules/process/client/';

            // datasets state routing
            $stateProvider
                .state('lab', {
                    url: '/lab',
                    abstract: true,
                    template: '<ui-view/>'
                })
                .state('lab.process', {
                    url: '/process',
                    controller: 'ProcessMainController',
                    controllerAs: 'ProcessMain',
                    templateUrl: MODULE_PATH + 'main/process.main.html',
                    params: {data: null}
                })
                .state('lab.process.popup', {
                    url: '/:type',
                    modal: false,
                    size: 'lg',
                    // common way around to use angular-ui modals with
                    // the router having nested states
                    template: '<div ui-view="modal"></div>',
                    resolve: {
                        // parameters to be shared by all the child states
                        // including the modal and the states for task options
                        processService: 'Process',
                        usersDatasets: function (processService) {
                            return processService.getUsersDatasets();
                        },
                        selectedDataset: function (processService) {
                            return processService.getSelectedDataset();
                        },
                        process: function (processService) {
                            return processService.getSelectedProcess();
                        }
                    },
                    views: {
                        'modal@': {
                            templateUrl: MODULE_PATH + 'modal/process.modal.html',
                            controller: 'ProcessModalController',
                            controllerAs: 'ProcessModal'
                        }
                    }
                })
                .state('lab.process.popup.taskoptions', {
                    url: '/taskoptions',
                    template: '<ui-view/>'
                })
                .state('lab.process.popup.taskoptions.merge', {
                    url: '/merge',
                    templateUrl: MODULE_PATH + 'tasks/tasks.merge.html',
                    controller: 'MergeTaskOptionsController',
                    controllerAs: 'MergeTaskOptions',
                    params: {options: {}}
                })
                .state('lab.process.popup.taskoptions.linearregression', {
                    url: '/linearregression',
                    templateUrl: MODULE_PATH + 'tasks/tasks.linearregression.html',
                    controller: 'LROptionsController',
                    controllerAs: 'LROptions',
                    params: {options: {}}
                })
                .state('lab.process2', {
                    url: '/process2',
                    controller: 'ProcessWizardMainController',
                    controllerAs: 'ProcessWizard',
                    templateUrl: MODULE_PATH + 'wizard/process.wizard.main.html',
                    params: {data: null}
                })
                .state('lab.process2.step1', {
                    url: '/step1',
                    controller: 'ProcessWizardStep1Controller',
                    controllerAs: 'ProcessStep1',
                    templateUrl: MODULE_PATH + 'wizard/process.wizard.step1.html'
                })
                .state('lab.process2.step2',{
                    url: '/step2',
                    template: '<ui-view/>'
                })
                .state('lab.process2.step2.newmodel', {
                    url: '/newmodel',
                    controller: 'ProcessWizardStep2NewModelController',
                    controllerAs: 'ProcessStep2',
                    templateUrl: MODULE_PATH + 'wizard/process.wizard.step2.newmodel.html'
                })
                .state('lab.process2.step2.existingmodel', {
                    url: '/existingmodel',
                    controller: 'ProcessWizardStep2ExistingModelController',
                    controllerAs: 'ProcessStep2',
                    templateUrl: MODULE_PATH + 'wizard/process.wizard.step2.existingmodel.html'
                })
                .state('lab.process2.step3', {
                    url: '/step3',
                    views: {
                        '' : {
                            controller: 'ProcessWizardStep3Controller',
                            controllerAs: 'ProcessStep3',
                            templateUrl: MODULE_PATH + 'wizard/process.wizard.step3.html'
                        },
                        'datasetsearch@' : {
                            templateUrl: 'modules/datasets/client/list/datasets.list.html',
                            controller: 'DatasetsListController',
                            controllerAs: 'DatasetsList'
                        }
                    }
                })
                .state('lab.process2.step4', {
                    url: '/step4',
                    controller: 'ProcessWizardStep4Controller',
                    controllerAs: 'ProcessStep4',
                    templateUrl: MODULE_PATH + 'wizard/process.wizard.step4.html'
                })
                .state('lab.process2.step4.linearregression', {
                    templateUrl: MODULE_PATH + 'tasks/tasks.linearregression.html',
                    controller: 'LROptionsController',
                    controllerAs: 'LROptions',
                    params: {
                        id: {},
                        options: {}
                    }
                })
                .state('lab.process2.step4.predict', {
                    templateUrl: MODULE_PATH + 'tasks/tasks.predict.html',
                    controller: 'PredictOptionsController',
                    controllerAs: 'PredictOptions',
                    params: {

                        id: {},
                        options: {

                        }
                    }
                });
        }
    ]);
