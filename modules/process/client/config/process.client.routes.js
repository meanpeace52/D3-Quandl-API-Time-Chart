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
                  params: { data: null }
                })
                .state('lab.process.popup', {
                  url: '/:type',
                  modal: true,
                  size: 'lg',
                  // common way around to use angular-ui modals with
                  // the router having nested states
                  template: '<div ui-view="modal"></div>',
                  resolve: {
                    // parameters to be shared by all the child states
                    // including the modal and the states for task options
                    processService: 'Process',
                    usersDatasets: function(processService) {
                      return processService.getUsersDatasets();
                    },
                    selectedDataset: function(processService) {
                      return processService.getSelectedDataset();
                    },
                    process: function(processService) {
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
                  params: { options: {} }
                })
                .state('lab.process.popup.taskoptions.linearregression', {
                  url: '/linearregression',
                  templateUrl: MODULE_PATH + 'tasks/tasks.linearregression.html',
                  controller: 'LROptionsController',
                  controllerAs: 'LROptions',
                  params: { options: {} }
                });
        }
    ]);
