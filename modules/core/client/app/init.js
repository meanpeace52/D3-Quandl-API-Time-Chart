'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies)

    .config(['$locationProvider', '$httpProvider', '$translateProvider',
        function ($locationProvider, $httpProvider, $translateProvider) {
            $locationProvider.html5Mode(true).hashPrefix('!');

            $translateProvider.useStaticFilesLoader({
                prefix: '/locales/',
                suffix: '.json'
            });

            $translateProvider
                .useLocalStorage()
                .useSanitizeValueStrategy('escapeParameters')
                .registerAvailableLanguageKeys(['en', 'nl', 'pt'], {
                    'en_US': 'en',
                    'en_UK': 'en',
                    'nl_BE': 'nl',
                    'nl_NL': 'nl',
                    'pt_BR': 'pt',
                    'pt_PT': 'pt'
                })
                .determinePreferredLanguage();

            $httpProvider.interceptors.push('authInterceptor');
        }
    ])

    .run(function ($rootScope, $state, Authentication) {
        
        // Check authentication before changing state
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if (toState.data && toState.data.hasOwnProperty('roles')) {
                
                var allowed = false;
                
                if (toState.data.roles.length) {
                    toState.data.roles.forEach(function (role) {
                        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
                            allowed = true;
                            return;
                        }
                    });
                }
                
                if (!allowed) {
                    event.preventDefault();
                    if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
                        $state.go('forbidden');
                    } else {
                        $state.go('authentication.signin').then(function () {
                            storePreviousState(toState, toParams);
                        });
                    }
                }
            }
        });

        // Record previous state
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            storePreviousState(fromState, fromParams);
        });

        // Store previous state
        function storePreviousState(state, params) {
            // only store this state if it shouldn't be ignored
            if (!state.data || !state.data.ignoreState) {
                $state.previous = {
                    state: state,
                    params: params,
                    href: $state.href(state, params)
                };
            }
        }
    });

//Then define the init function for starting up the application
angular.element(document).ready(function () {
    //Fixing facebook bug with redirect
    if (window.location.hash && window.location.hash === '#_=_') {
        if (window.history && history.pushState) {
            window.history.pushState('', document.title, window.location.pathname);
        } else {
            // Prevent scrolling by storing the page's current scroll offset
            var scroll = {
                top: document.body.scrollTop,
                left: document.body.scrollLeft
            };
            window.location.hash = '';
            // Restore the scroll offset, should be flicker free
            document.body.scrollTop = scroll.top;
            document.body.scrollLeft = scroll.left;
        }
    }

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
