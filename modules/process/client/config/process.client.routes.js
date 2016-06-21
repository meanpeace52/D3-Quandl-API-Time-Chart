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
                    // pre-populate tasks and it's options
                    // from the currently selected process
                    processService: 'Process',
                    selectedTasks: function(processService) {
                      return (processService.getSelectedProcess() || {}).tasks;
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
                });
        }
    ]);
