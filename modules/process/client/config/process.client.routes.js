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
                  controller: 'ProcessMainController',
                  controllerAs: 'ProcessMain',
                  templateUrl: MODULE_PATH + 'main/process.main.html'
                });
        }
    ]);
