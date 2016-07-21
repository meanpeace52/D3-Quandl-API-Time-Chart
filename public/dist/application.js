'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
    // Init module configuration options
    var applicationModuleName = 'mean';
    var applicationModuleVendorDependencies = [
        'angularFileUpload',
        'angularMoment',
        'ngAnimate',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'LocalStorageModule',
        'pascalprecht.translate',
        'ui.bootstrap',
        'ui.router',
        'ui.utils'
    ];

    // Add a new vertical module
    var registerModule = function (moduleName, dependencies) {
        // Create angular module
        angular.module(moduleName, dependencies || []);

        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    };

    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
})();


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

    .run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {
        
        // Check authentication before changing state
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if (toState.data) {
                var allowed = false;
                console.log(toState.data, Authentication.user.roles);
                if (toState.data.roles.length) {
                    toState.data.roles.forEach(function (role) {
                        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
                            allowed = true;
                            return true;
                        }
                    });
                }
                
                else {
                    allowed = true;
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
    }]);

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

'use strict';

ApplicationConfiguration.registerModule('admin', ['core']);

ApplicationConfiguration.registerModule('admin.artists', ['core.admin']);
ApplicationConfiguration.registerModule('admin.artists.routes', ['core.admin.routes']);

ApplicationConfiguration.registerModule('admin.paintings', ['core.admin']);
ApplicationConfiguration.registerModule('admin.paintings.routes', ['core.admin.routes']);

ApplicationConfiguration.registerModule('admin.users', ['core.admin']);
ApplicationConfiguration.registerModule('admin.users.routes', ['core.admin.routes']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('datasets', ['datatables']);

(function (app) {
  'use strict';

  app.registerModule('models');
})(ApplicationConfiguration);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('posts');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

'use strict';

angular.module('admin.users')

.run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'admin', {
            title: 'Manage Users',
            state: 'admin.users'
        });
    }
]);

'use strict';

angular.module('admin.users.routes')

    .config(['$stateProvider',
        function ($stateProvider) {
            var MODULE_PATH = 'modules/admin/client/users/';

            $stateProvider

                .state('admin.users', {
                    url: '/users',
                    templateUrl: MODULE_PATH + 'list/admin.users.list.html',
                    controller: 'AdminUserListController'
                })

                .state('admin.user', {
                    abstract: true,
                    url: '/users/:userId',
                    template: '<ui-view/>',
                    resolve: {
                        User: ['$stateParams', 'AdminUser', function ($stateParams, AdminUser) {
                            return AdminUser.get({
                                userId: $stateParams.userId
                            });
                        }]
                    }
                })

                .state('admin.user.detail', {
                    url: '',
                    templateUrl: MODULE_PATH + 'detail/admin.user.detail.html',
                    controller: 'AdminUserDetailController as AdminUserDetail'
                })

                .state('admin.user.edit', {
                    url: '/edit',
                    templateUrl: MODULE_PATH + 'edit/admin.user.edit.html',
                    controller: 'AdminUserEditController as AdminUserEdit'
                });

        }
    ]);

'use strict';

angular.module('admin.users')

.controller('AdminUserDetailController', ['$state', 'Authentication', 'User',
    function ($state, Authentication, User) {
        var vm = this;
        vm.authentication = Authentication;
        vm.user = User;

        vm.remove = function (user) {
            if (confirm('Are you sure you want to delete this user?')) {
                if (user) {
                    user.$remove();

                    vm.users.splice(vm.users.indexOf(user), 1);
                } else {
                    vm.user.$remove(function () {
                        $state.go('admin.users');
                    });
                }
            }
        };

    }
]);

'use strict';

angular.module('admin.users')

.controller('AdminUserEditController', ['$scope', '$state', 'Authentication', 'User',
    function ($scope, $state, Authentication, User) {
        var vm = this;
        vm.authentication = Authentication;
        vm.user = User;

        vm.update = function (isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');

                return false;
            }

            vm.user.$update(function () {
                $state.go('admin.user.detail', { userId: vm.user._id });
            }, function (errorResponse) {
                vm.error = errorResponse.data.message;
            });
        };
    }
]);

'use strict';

angular.module('admin.users')

.controller('AdminUserListController', ['$scope', '$filter', 'AdminUser',
    function ($scope, $filter, AdminUser) {
        AdminUser.query(function (data) {
            $scope.users = data;
            $scope.buildPager();
        });

        $scope.buildPager = function () {
            $scope.pagedItems = [];
            $scope.itemsPerPage = 15;
            $scope.currentPage = 1;
            $scope.figureOutItemsToDisplay();
        };

        $scope.figureOutItemsToDisplay = function () {
            $scope.filteredItems = $filter('filter')($scope.users, {
                $: $scope.search
            });
            $scope.filterLength = $scope.filteredItems.length;
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
            var end = begin + $scope.itemsPerPage;
            $scope.pagedItems = $scope.filteredItems.slice(begin, end);
        };

        $scope.pageChanged = function () {
            $scope.figureOutItemsToDisplay();
        };
    }
]);

'use strict';

angular.module('admin.users')

.factory('AdminUser', ['$resource',
    function ($resource) {
        return $resource('api/users/:userId', {
            userId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

'use strict';

angular.module('core.admin').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Admin',
            state: 'admin',
            type: 'dropdown',
            roles: ['admin']
        });
    }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('admin', {
                abstract: true,
                url: '/admin',
                template: '<ui-view/>',
                data: {
                    roles: ['admin']
                }
            });
    }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        // Redirect to 404 when route not found
        $urlRouterProvider.otherwise('not-found');

        // Home state routing
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'modules/core/client/views/home.client.view.html'
            })
            .state('not-found', {
                url: '/not-found',
                templateUrl: 'modules/core/client/views/404.client.view.html'
            });
    }
]);

'use strict';

;(function () {
  
  var CarouselCtrl = function ($scope) {

    var vm = this;
    vm.myInterval = 5000;
    vm.noWrapSlides = false;
    vm.active = 0;
    var slides = vm.slides = [];
    var currIndex = 0;

    vm.addSlide = function() {
      var newWidth = 600 + slides.length + 1;
      slides.push({
        image: 'http://lorempixel.com/' + newWidth + '/300',
        text: ['Nice image','Awesome photograph','That is so cool','I love that'][slides.length % 4],
        id: currIndex++
      });
    };

    vm.randomize = function() {
      var indexes = generateIndexesArray();
      assignNewIndexesToSlides(indexes);
    };

    for (var i = 0; i < 4; i++) {
      vm.addSlide();
    }

    // Randomize logic below
    function assignNewIndexesToSlides(indexes) {
      for (var i = 0, l = slides.length; i < l; i++) {
        slides[i].id = indexes.pop();
      }
    }

    function generateIndexesArray() {
      var indexes = [];
      for (var i = 0; i < currIndex; ++i) {
        indexes[i] = i;
      }
      return shuffle(indexes);
    }

    // http://stackoverflow.com/questions/962802#962890
    function shuffle(array) {
      var tmp, current, top = array.length;

      if (top) {
        while (--top) {
          current = Math.floor(Math.random() * (top + 1));
          tmp = array[current];
          array[current] = array[top];
          array[top] = tmp;
        }
      }

      return array;
    }

  };

  angular.module('core')
    .controller('CarouselCtrl', ['$scope', CarouselCtrl]);

})();

'use strict';

angular.module('core').controller('HeaderController', ['$rootScope', '$scope', '$state', 'Authentication', 'Menus',
    function ($rootScope, $scope, $state, Authentication, Menus) {
        // Expose view variables
        $scope.$state = $state;
        $scope.authentication = Authentication;

        // Get the  menu
        $scope.menu = Menus.getMenu('topbar');
        
         Menus.addMenuItem('topbar', {
                title: 'Home',
                state: 'home',
                roles: ['*'],
                position: 0
            });
            
         Menus.addMenuItem('topbar', {
            title: 'Finance',
            state: 'finance',
            roles: ['*'],
            position: 1
        });

        // Toggle the menu items
        $scope.isCollapsed = false;
        $scope.toggleCollapsibleMenu = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        $rootScope.isToggleSideBar = !!$scope.authentication.user;
        $scope.toggleSideBar = function () {
            $rootScope.isToggleSideBar = !$rootScope.isToggleSideBar;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function () {
            $scope.isCollapsed = false;
        });
    }
]);

'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
    function ($scope, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        
    }
]);

'use strict';

angular.module('core')
  .controller('SideBarCtrl', ['$rootScope', '$scope', 'Authentication', 'Menus',
		function ($rootScope,$scope,Authentication,Menus) {

			$scope.authentication = Authentication;
			$scope.user = Authentication.user;
			$scope.sidebarMenu = Menus.getMenu('sidebar');

			// Add the Lab sidebar item
      Menus.addMenuItem('sidebar', {
          title: 'Lab',
          state: 'datasets.list',
          type: 'item',
          faIcon: 'fa-flask',
          roles: ['user'],
          position: 0
      });

			// Add the Posts sidebar item
      Menus.addMenuItem('sidebar', {
          title: 'My Posts',
          state: 'posts.list',
          faIcon: 'fa-file',
          roles: ['user'],
          position: 1
      });

      // Add the My Models sidebar item
      Menus.addMenuItem('sidebar', {
          title: 'My Models',
          state: 'models.list',
          faIcon: 'fa-cogs',
          roles: ['user'],
          position: 3
      });


			$scope.$watch(
				function () {
					return Authentication.user;
				},
				function (newVal) {
					if (newVal && newVal.hasOwnProperty('username')) {
						$rootScope.isToggleSideBar = true;
						Menus.removeMenuItem('sidebar','My Data');
						// Add the My Data sidebar item
            Menus.addMenuItem('sidebar', {
                title: 'My Data',
                state: 'users.profilepage({ username: "'+newVal.username+'" })',
                faIcon: 'fa-line-chart',
                roles: ['user'],
                position: 2
            });

					}
				});

		}
]);

'use strict';

;(function () {
 		
  var changeTheme = function (Authentication) {
      return {
          restrict: 'A',
          link: function (scope, element, attrs) {
          	var link = document.createElement('link');
          	link.rel = 'stylesheet';
            angular.element('head').append(link);

          	scope.$watch(function () {
          		return Authentication.user;
          	}, function (newValue) {
          		if (newValue) {
          			link.href = 'lib/startbootstrap-modern-business-1.0.5/css/modern-business.css';
          		} else {
          			link.href = 'lib/startbootstrap-landing-page-1.0.5/css/landing-page.css';
          		}
          	});
          }
      };
  };

  angular.module('core')
      .directive('changeTheme', ['Authentication', changeTheme]);
 
})();
'use strict';

;(function () {
 		
  var isNeedContainer = function ($rootScope, $window, $timeout) {
      return {
          restrict: 'A',
          link: function (scope, element, attrs) {
            var curState = $window.location.pathname === '/' ? 'home' : $window.location.pathname;
            var classes = ['container','container-fluid'];
            var classIdx = 0;
            var isToggle = false;

            attrs.$observe('isNeedContainer', function(value) {
              isToggle = value;
            });

            scope.$watch(function () {
              return $rootScope.isToggleSideBar;
            }, function (newValue) {
              if (isToggle === 'toggle' || curState !== 'home') {
                toggleContainer(newValue);
              }
            });

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
              curState = toState.name;
              if (curState === 'home') {
                element.attr('class', '');
              } else {
                toggleContainer($rootScope.isToggleSideBar);
              }
            });

            function toggleContainer (boolVal) {
              if (boolVal) {

                $timeout(function(){
                  element
                    .addClass('container-fluid')
                    .removeClass('container');
                  }, 400);
                  
                } else {
                  element
                    .addClass('container')
                    .removeClass('container-fluid');
                }
            }
          	
          }
      };
  };

  angular.module('core')
      .directive('isNeedContainer', ['$rootScope', '$window', '$timeout', isNeedContainer]);
 
})();
'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
    .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
        var linkFn = function (scope, el, attrs, formCtrl) {
            var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
                initCheck = false,
                showValidationMessages = false,
                blurred = false;

            options = scope.$eval(attrs.showErrors) || {};
            showSuccess = options.showSuccess || false;
            inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
            inputNgEl = angular.element(inputEl);
            inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

            if (!inputName) {
                throw 'show-errors element has no child input elements with a \'name\' attribute class';
            }

            var reset = function () {
                return $timeout(function () {
                    el.removeClass('has-error');
                    el.removeClass('has-success');
                    showValidationMessages = false;
                }, 0, false);
            };

            scope.$watch(function () {
                return formCtrl[inputName] && formCtrl[inputName].$invalid;
            }, function (invalid) {
                return toggleClasses(invalid);
            });

            scope.$on('show-errors-check-validity', function (event, name) {
                if (angular.isUndefined(name) || formCtrl.$name === name) {
                    initCheck = true;
                    showValidationMessages = true;

                    return toggleClasses(formCtrl[inputName].$invalid);
                }
            });

            scope.$on('show-errors-reset', function (event, name) {
                if (angular.isUndefined(name) || formCtrl.$name === name) {
                    return reset();
                }
            });

            toggleClasses = function (invalid) {
                el.toggleClass('has-error', showValidationMessages && invalid);
                if (showSuccess) {
                    return el.toggleClass('has-success', showValidationMessages && !invalid);
                }
            };
        };

        return {
            restrict: 'A',
            require: '^form',
            compile: function (elem, attrs) {
                if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
                    if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
                        throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
                    }
                }
                return linkFn;
            }
        };
    }]);

'use strict';

;(function () {
 		
  var toggleSidebar = function ($rootScope, $window) {
      return {
          restrict: 'A',
          link: function (scope, element, attrs) {

          	scope.$watch(function () {
          		return $rootScope.isToggleSideBar;
          	}, function (newValue) {
          		if (newValue) {
          			element
                  .addClass('toggled');
          		} else {
          			element
                  .removeClass('toggled');
          		}
          	});

            scope.$watch(function () {
              return $window.innerWidth;
            }, function (newValue) {
              if (newValue < 768 && $rootScope.isToggleSideBar) {
                $rootScope.isToggleSideBar = false;
                element
                  .removeClass('toggled');
              } 
            });

          }
      };
  };

  angular.module('core')
      .directive('toggleSidebar', ['$rootScope', '$window', toggleSidebar]);
 
})();
'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
    function ($q, $injector) {
        return {
            responseError: function(rejection) {
                if (!rejection.config.ignoreAuthModule) {
                    switch (rejection.status) {
                        case 401:
                            $injector.get('$state').transitionTo('authentication.signin');
                            break;
                        case 403:
                            $injector.get('$state').transitionTo('forbidden');
                            break;
                    }
                }
                // otherwise, default behaviour
                return $q.reject(rejection);
            }
        };
    }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
    function () {
        // Define a set of default roles
        this.defaultRoles = ['user', 'admin'];

        // Define the menus object
        this.menus = {};

        // A private function for rendering decision
        var shouldRender = function (user) {
            if (!!~this.roles.indexOf('*')) {
                return true;
            } else {
                if (!user) {
                    return false;
                }
                for (var userRoleIndex in user.roles) {
                    for (var roleIndex in this.roles) {
                        if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                            return true;
                        }
                    }
                }
            }

            return false;
        };

        // Validate menu existance
        this.validateMenuExistance = function (menuId) {
            if (menuId && menuId.length) {
                if (this.menus[menuId]) {
                    return true;
                } else {
                    throw new Error('Menu does not exist');
                }
            } else {
                throw new Error('MenuId was not provided');
            }

            return false;
        };

        // Get the menu object by menu id
        this.getMenu = function (menuId) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Return the menu object
            return this.menus[menuId];
        };

        // Add new menu object by menu id
        this.addMenu = function (menuId, options) {
            options = options || {};

            // Create the new menu
            this.menus[menuId] = {
                roles: options.roles || this.defaultRoles,
                items: options.items || [],
                shouldRender: shouldRender
            };

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeMenu = function (menuId) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Return the menu object
            delete this.menus[menuId];
        };

        // Add menu item object
        this.addMenuItem = function (menuId, options) {
            options = options || {};

            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Push new menu item
            this.menus[menuId].items.push({
                title: options.title || '',
                state: options.state || '',
                type: options.type || 'item',
                class: options.class,
                faIcon: options.faIcon,
                roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
                position: options.position || 0,
                items: [],
                shouldRender: shouldRender
            });

            // Add submenu items
            if (options.items) {
                for (var i in options.items) {
                    this.addSubMenuItem(menuId, options.state, options.items[i]);
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Add submenu item object
        this.addSubMenuItem = function (menuId, parentItemState, options) {
            options = options || {};

            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item
            for (var itemIndex in this.menus[menuId].items) {
                if (this.menus[menuId].items[itemIndex].state === parentItemState) {
                    // Push new submenu item
                    this.menus[menuId].items[itemIndex].items.push({
                        title: options.title || '',
                        state: options.state || '',
                        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
                        position: options.position || 0,
                        shouldRender: shouldRender
                    });
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeMenuItem = function (menuId, menuItemState) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item to remove
            for (var itemIndex in this.menus[menuId].items) {
                if (this.menus[menuId].items[itemIndex].state === menuItemState) {
                    this.menus[menuId].items.splice(itemIndex, 1);
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeSubMenuItem = function (menuId, submenuItemState) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item to remove
            for (var itemIndex in this.menus[menuId].items) {
                for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
                    if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
                        this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
                    }
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        //Adding the topbar menu
        this.addMenu('topbar', {
            roles: ['*']
        });
        //Adding the sidebar menu
        this.addMenu('sidebar', {
            roles: ['user']
        });
    }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
    function (Authentication, $state, $timeout) {
        // Connect to Socket.io server
        this.connect = function () {
            // Connect only when authenticated
            if (Authentication.user) {
                this.socket = io();
            }
        };
        this.connect();

        // Wrap the Socket.io 'on' method
        this.on = function (eventName, callback) {
            if (this.socket) {
                this.socket.on(eventName, function (data) {
                    $timeout(function () {
                        callback(data);
                    });
                });
            }
        };

        // Wrap the Socket.io 'emit' method
        this.emit = function (eventName, data) {
            if (this.socket) {
                this.socket.emit(eventName, data);
            }
        };

        // Wrap the Socket.io 'removeListener' method
        this.removeListener = function (eventName) {
            if (this.socket) {
                this.socket.removeListener(eventName);
            }
        };
    }
]);

'use strict';

// Configuring the datasets module
angular.module('datasets')
    .run(['Menus',
        function (Menus) {
            // Add the datasets dropdown item
            Menus.addMenuItem('topbar', {
                title: 'Datasets',
                state: 'datasets.list',
                roles: ['user'],
                position: 2
            });

/*
            // Add the dropdown list item
            Menus.addSubMenuItem('topbar', 'datasets', {
                title: 'List datasets',
                state: 'datasets.list'
            });

            // Add the dropdown create item
            Menus.addSubMenuItem('topbar', 'datasets', {
                title: 'Create datasets',
                state: 'datasets.create',
                roles: ['user']
            });
*/
            
        }
    ]);

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
						ds1: {squash: true, value: null},
						ds2: {squash: true, value: null},
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

'use strict';

//Posts Create Controller
angular.module('posts')
    .controller('PostsCreateController',
        ['$scope', '$state', 'Authentication', 'Posts',
            function ($scope, $state, Authentication, Posts) {
                var vm = this;

                vm.authentification = Authentication;
                vm.post = new Posts();

                // Create new Post
                vm.create = function (isValid) {
                    vm.error = null;

                    if (!isValid) {
                        $scope.$broadcast('show-errors-check-validity', 'postForm');

                        return false;
                    }

                    // Redirect after save
                    vm.post.$save(function (response) {
                        $state.go('posts.detail', { postId: response._id });

                    }, function (errorResponse) {
                        vm.error = errorResponse.data.message;
                    });
                };
            }]);

'use strict';

//Datasets Detail Controller
angular.module('datasets')
    .controller('DatasetsDetailController',
        ['$stateParams', 'Authentication', 'Datasets',
            function ($stateParams, Authentication, Datasets) {
                var vm = this;

                vm.authentication = Authentication;

                vm.dataset = Datasets.get({
                    datasetId: $stateParams.datasetId
                });

                console.log(vm.authentication);
                console.log(vm.dataset);

            }]);

'use strict';

//Datasets Detail Controller
angular.module('datasets')
    .controller('DatasetsDetailModalController',
        ['$modalInstance', 'Datasets', 'viewingDataset',
            function ($modalInstance, Datasets, viewingDataset) {
                var vm = this;
                vm.viewingDataset = viewingDataset;
                vm.columns = [];
                vm.rows = [];
                vm.hasLoadedData = false;

                Datasets.getDatasetWithS3(viewingDataset._id).then(function (data) {
                    vm.columns = data.columns;
                    vm.rows = data.rows;
                    vm.hasLoadedData = true;
                });

                vm.ok = function () {
                    $modalInstance.close(true);
                };

                vm.cancel = function () {
                    $modalInstance.dismiss(false);
                };

                vm.addtoUser = function () {
                    Datasets.addToUserApiCall(viewingDataset).then(function (dataset) {
                        $modalInstance.close(true);
                    });
                };

                vm.mergeDataset = function () {
                    if (_.has(vm, 'selectedDatasetOption') && _.has(vm.selectedDatasetOption, '_id')) {
                        vm.hasLoadedData = false;
                        Datasets.getDatasetWithS3(vm.selectedDatasetOption._id).then(function (data) {
                            vm.selectedDatasetColumns = data.columns;
                            vm.selectedDatasetRows = data.rows;
                            console.log(vm.selectedDatasetRows, vm.selectedDatasetColumns);
                            vm.hasLoadedData = true;
                        });
                    } else {
                        alert('select a valid dataset');
                    }
                };
            }]);

'use strict';

//Datasets Detail Controller
angular.module('datasets')
    .controller('DatasetsEditController',
        ['$stateParams', 'Datasets', 'UsersFactory', 'Authentication',
            function ($stateParams, Datasets, UsersFactory, Authentication) {
                var vm = this;

				vm.authentication = Authentication;
				vm.user = Authentication.user;

				vm.viewingDataset = {};
				vm.usersDatasets = [];
				vm.columns = [];
				vm.rows = [];
				vm.hasLoadedData = false;

                UsersFactory.finduserdatasets(vm.user).then(function (usersDatasets) {
                	vm.usersDatasets = usersDatasets;
                });

                Datasets.crud.get({datasetId: $stateParams.datasetId})
                	.$promise.then(function (dataset) {
	                	vm.viewingDataset = dataset;
	                	return dataset._id;
            		})
					.then(Datasets.getDatasetWithS3.bind(Datasets))
                	.then(function (data) {
						vm.columns = data.columns;
						vm.rows = data.rows;
						vm.hasLoadedData = true;
					});

                vm.addtoUser = function () {
                    Datasets.addToUserApiCall(vm.viewingDataset);
                };

                vm.mergeDataset = function () {
                    if (_.has(vm, 'selectedDatasetOption') && _.has(vm.selectedDatasetOption, '_id')) {
                        vm.hasLoadedData = false;
                        Datasets.getDatasetWithS3(vm.selectedDatasetOption._id).then(function (data) {
                            vm.selectedDatasetColumns = data.columns;
                            vm.selectedDatasetRows = data.rows;
                            vm.hasLoadedData = true;
                        });
                    } else {
                        alert('select a valid dataset');
                    }
                };
            }]);

'use strict';

//datasets List Controller
angular.module('datasets').controller('DatasetsListController',
    ['$state', '$sce', '$modal', 'Authentication', 'Datasets',
    function ($state, $sce, $modal, Authentication, Datasets) {
        var vm = this;

        vm.authentication = Authentication;
        vm.loadingResults = false;

        vm.search = function () {
            vm.loadingResults = true;
            Datasets.search(vm.q)
                .success(function (response) {
                    vm.searchResults = response;
                    vm.loadingResults = false;
                })
                .error(function (error) {
                    console.log(error);
                    vm.loadingResults = false;
                });
        };

        vm.showTitle = function (title) {
            var q = vm.q,
                matcher = new RegExp(q, 'gi');
            var highlightedTitle = title.replace(matcher, '<span class="matched">$&</span>');
            // console.log(highlightedTitle);
            return $sce.trustAsHtml(highlightedTitle);
        };

        vm.addToUser = function (dataset) {
            Datasets.addToUserApiCall(dataset)
                .then(function (data) {
                    console.log(data);
                })
                .catch(function (error) {
                    console.log(error);
                });
        };

    	vm.showData = function (dataset) {
    		var modalInstance = $modal.open({
    			templateUrl: 'modules/datasets/client/detail/datasets.detail.modal.html',
    			controller: 'DatasetsDetailModalController',
    			controllerAs: 'DatasetDetailModal',
    			size: 'md',
    			resolve: {
    				viewingDataset: dataset
    			}
    		});
    	};
}]);


'use strict';

angular.module('datasets')
    .factory('Datasets', ['$resource', '$http',
        function ($resource, $http) {

            return {
                crud: crud(),
                search: search,
                addToUserApiCall: addToUserApiCall,
                getDatasetWithS3: getDatasetWithS3,
                saveCustom: saveCustom,
                mergeColumns: mergeColumns
            };

            function crud() {
                return $resource('api/datasets/:datasetId', {
                    studentId: '@_id'
                }, {
                    update: {
                        method: 'PUT'
                    }
                });
            }


            function search(q) {
                return $http({
                    url: 'api/datasets/search?q=' + q,
                    method: 'GET'
                });
            }

            function addToUserApiCall(dataset) {
                return $http({
                    url: 'api/datasets',
                    data: dataset,
                    method: 'POST'
                }).then(function (res) {
                    console.log('done saving to user', res);
                    return res.data;
                }).catch(function (err) {
                    console.error('error saving to user', err);
                });
            }

            function getDatasetWithS3(datasetId) {
            	return $http({
            		url: 'api/datasets/' + datasetId + '/withs3',
            		method: 'GET'
            	}).then(function(res) {
                    return res.data;
				}, function (err) {
                    console.error(err);
                });
            }

            function saveCustom(dataset) {
                return $http({
                    url: '/api/datasets/saveCustom',
                    data: dataset,
                    method: 'POST'
                }).then(function(res) {
                    return res.data;
                }, function (err) {
                    console.log(err);
                });
            }

            function mergeColumns (data) {
                return $http({
                    url: '/api/datasets/merge',
                    data: data,
                    method: 'POST'
                }).then(function(res) {
                    return res.data;
                }, function (err) {
                    console.error(err);
                });
            }
        }
    ]);



'use strict';

angular.module('datasets')
    .controller('WorkbenchActionModalCtrl',
        ['$scope','$modalInstance', 'modalData', 'Datasets',
            function ($scope, $modalInstance, modalData, Datasets) {
                var vm = this;
                vm.actionForm = $scope.actionForm;
                vm.modalType = modalData.type;
                vm.modalTableData = modalData.tableData;
                vm.modalOperationData = modalData.operationData;
                vm.infoText = 'Table complete';

                vm.columns = [];
                vm.rows = [];

                vm.mergeParams = {};

                vm.hasLoadedDataErr = false;
                vm.hasLoadedData = true;
                vm.actionComplete = false;
                vm.inprogress = true;


                // need to disable submit btn 
                vm.isNameNotChange = vm.modalTableData.hasOwnProperty('title') ? true : false;

                switch (vm.modalType) {
                    case 'merge':
                        vm.title = 'Tables merging';
                        vm.btnTxt = 'Merge';
                        vm.notation = '(should be different from initial)';
                        if (vm.modalTableData.title) {
                            vm.mergeParams.tableName = vm.modalTableData.title;
                        }
                        mergeColumns(vm.modalOperationData).then(function (res) {
                            console.log('merge',res);
                            if (res && isDataCorrect(res)) {
                                vm.columns = res.columns;
                                vm.rows = res.rows;
                                vm.hasLoadedDataErr = false;
                            } else {
                                vm.hasLoadedDataErr = true;
                            }

                            vm.inprogress = false;
                            vm.hasLoadedData = false;
                        });

                    break;
                    case 'save':

                        console.log(vm.modalOperationData);
                        vm.title = 'Saving dataset';
                        vm.btnTxt = 'Save';
                        vm.notation = '(should be different from initial)';
                        if (vm.modalTableData.title) {
                            vm.mergeParams.tableName = vm.modalTableData.title;
                        }
                        saveDataset(vm.modalOperationData).then(function (res) {
                            console.log('save',res);
                            if (isDataCorrect(res)) {
                                vm.columns = res.columns;
                                vm.rows = res.rows;
                                vm.hasLoadedDataErr = false;
                            } else {
                                vm.hasLoadedDataErr = true;
                            }

                            vm.inprogress = false;
                            vm.hasLoadedData = false;
                        });

                    break;
                }

                vm.submit = function(valid) {
                    if(valid){
                        vm.inprogress = true;
                        vm.hasLoadedData = true;
                        var formData = getModalFormData();

                        switch (vm.modalType) {
                            case 'merge':
                                vm.modalOperationData.params.title = formData.name;
                                vm.modalOperationData.params.notice = formData.note;
                                vm.modalOperationData.params.action = 'insert';

                                mergeColumns(vm.modalOperationData).then(saveSuccess);
                            break;
                            case 'save':
                                var params = angular.extend(vm.modalOperationData, {title:formData.name,notice:formData.note});
                                params.action = 'insert';

                                saveDataset(params).then(saveSuccess);
                            break;
                        }
                    }

                    function saveSuccess () {
                        vm.actionComplete = true;
                        vm.hasLoadedData = false;
                        vm.infoText = 'Save complete';
                    }
                };

                vm.compareName = compareName;

                function compareName () {
                    if (vm.modalTableData.title) {
                        var name = getModalFormData().name;
                        vm.isNameNotChange = vm.modalTableData.title === name;
                    }
                }

                function getModalFormData () {
                    return {
                        name: vm.mergeParams.tableName ? vm.mergeParams.tableName.replace(/<\/?[^>]+(>|$)/g, '') : '',
                        note: vm.mergeParams.hasOwnProperty('notes') ? vm.mergeParams.notes.replace(/<\/?[^>]+(>|$)/g, '') : ''
                    };
                }


                function mergeColumns (params) {
                    return Datasets.mergeColumns(params).then(function (data) {
                        return data;
                    });                        
                }

                function saveDataset (params) {
                    // var formData = getModalFormData();
                    // var data = {
                    //     title: formData.name,
                    //     notice: formData.note,
                    //     action: 'insert',
                    //     id: vm.modalOperationData.id,
                    //     columns: vm.modalOperationData.columns,
                    // };
                    return Datasets.saveCustom(params).then(function (data) {
                        // vm.actionComplete = true;
                        // vm.inprogress = false;
                        console.log(data);
                        // getResultTabelData(data._id);
                        return data;
                    }, 
                    function (err) {
                        console.warn(err);
                    });
                }

                function getResultTabelData (newTabelId) {
                    Datasets.getDatasetWithS3(newTabelId).then(function (data) {
                        vm.hasLoadedData = true;
                        console.log('getResultTabelData',data);
                        if (isDataCorrect(data)) {
                            vm.columns = data.columns;
                            vm.rows = data.rows;
                            vm.hasLoadedDataErr = false;
                        } else {
                            vm.hasLoadedDataErr = true;
                        }
                        
                    });
                }

                function isDataCorrect (data) {
                    return data.hasOwnProperty('columns') && data.columns.length > 0;
                }

                vm.ok = function () {
                    $modalInstance.close(true);
                };

                vm.cancel = function () {
                    $modalInstance.dismiss(false);
                };

                
            }]);

'use strict';

//Datasets Detail Controller
angular.module('datasets')
    /**
     * This wrapper is only used to compile custom title with checkbox
     */
    .directive('datatableWrapper', ["$timeout", "$compile", function datatableWrapper($timeout, $compile) {
        return {
            restrict: 'E',
            transclude: true,
            template: '<ng-transclude></ng-transclude>',
            link: link
        };

        function link(scope, element) {
            $timeout(function () {
                $compile(element.find('.title-radio-label'))(scope);
                $compile(element.find('.title-checkbox-label'))(scope);
            }, 0, false);
        }
    }])
    .directive('labelRadio', function () {
        return {
            restrict: 'A',
            link: link
        };

        function link(scope, element) {
            element.bind('click', function(event) {
                event.stopPropagation();
                event.preventDefault();
                element.children().prop('checked', true);
            });
        }
    })
    
    .controller('WorkbenchController',
        ['$scope','$stateParams', '$timeout', '$state', '$modal', 'Datasets', 'UsersFactory', 'Authentication', 'DTOptionsBuilder', 'DTColumnDefBuilder',
            function ($scope, $stateParams, $timeout, $state, $modal, Datasets, UsersFactory, Authentication, DTOptionsBuilder, DTColumnDefBuilder) {
                var vm = this;

				vm.authentication = Authentication;
				vm.user = Authentication.user;
                vm.mergeParams = {};
                vm.checkedPriColumns = {};

                vm.ds1 = {
                    data: null, 
                    hasLoadedData: false,
                    checkedColumns: null, 
                    hasLoadedDataIsFull: false,
                    tableOptions: null,
                    tableColumnDefs: [
                        DTColumnDefBuilder.newColumnDef(0).notSortable()
                    ],
                    _id: $stateParams.ds1,
                };
				vm.ds2 = {
                    data: null,
                    checkedColumns: null, 
                    hasLoadedData: false,
                    hasLoadedDataIsFull: false,
                    tableOptions: null,
                    tableColumnDefs: null,
                    _id: $stateParams.ds2,
                };
				vm.usersDatasets = [];

                $scope.$watch('$stateParams', function(newvalue) {
                        if (newvalue) {
                            console.log(newvalue);
                        }
                    }
                );

                
                function getDataset(container) {
                    var vmContainer = vm[container];
                    if (vmContainer && vmContainer._id) {
                        vmContainer.hasLoadedData = false;
                        vmContainer.hasLoadedDataIsFull = false;
                        vmContainer.checkedColumns = null;
                        clearPrimaryCol(container);

                        Datasets.crud.get({datasetId: vmContainer._id})
                            .$promise.then(function (dataset) {
                                vmContainer.data = dataset;
                                return dataset._id;
                            })
                            .then(Datasets.getDatasetWithS3.bind(Datasets))
                            .then(function (data) {
                                if (!data || (data && data.hasOwnProperty('columns') && !data.columns.length)) {
                                    vmContainer.hasLoadedData = true;
                                    return false;
                                } 

                                $timeout(function () {
                                    vmContainer.columns = data.columns;
                                    vmContainer.rows = _.map(data.rows, function (row, i) { 
                                        for (var val in row) {
                                            if (row.hasOwnProperty(val) && row[val].match(/"/g)) {
                                                row[val] = row[val].replace(/"/ig, '');  // del extra quotes if needed
                                            }
                                        }
                                        return row;
                                    });
                                    vmContainer.tableColumnDefs = _.map(data.columns, function (col, i) {
                                        if (col.match(/"/g)) {
                                            col = col.replace(/"/ig, '');// del extra quotes if needed
                                        }

                                        var text = '<label class="title-radio-label">'+
                                                        '<input type="radio" class="title-radio" name="primaryCol_'+container+'" value="'+col+'" ng-model="Workbench.mergeParams.primaryCol.'+container+'">'+
                                                        col+
                                                    '</label>'+
                                                    '<label class="title-checkbox-label">'+
                                                        '<input type="checkbox" class="title-checkbox" name="col_'+col+'_'+container+'" value="'+col+'" ng-model="Workbench.'+container+'.checkedColumns.'+col+'" ng-init="Workbench.'+container+'.checkedColumns.'+col+'=true">'+
                                                    '</label>';

                                        return DTColumnDefBuilder.newColumnDef(i).withTitle(text).notSortable();
                                    });
                                    vmContainer.tableOptions = DTOptionsBuilder.newOptions()
                                        .withOption('drawCallback', function (settings) { 
                                            var api = new $.fn.dataTable.Api(settings);
                                            var $tabel = $(api.table().node());
                                            $tabel.find('label').remove();
                                         })
                                        .withOption('lengthChange', false)
                                        .withOption('sort', false)
                                        .withOption('paging', false)
                                        .withOption('scrollY', '450px')
                                        .withOption('scrollX', '450px');
                                    vmContainer.hasLoadedData = true;
                                    vmContainer.hasLoadedDataIsFull = true;
                                },100);

                                

                            });
                    }
                }

                UsersFactory.finduserdatasets(vm.user).then(function (usersDatasets) {
                	vm.usersDatasets = usersDatasets;
                });
                

                // function checkForEmptyData () {
                        // var testData = [];
                //     UsersFactory.finduserdatasets(vm.user).then(function (usersDatasets) {
                //         vm.usersDatasets = usersDatasets;
                //         var listIds = _.map(usersDatasets, function(elem) {
                //             return elem._id;
                //         })

                //         testDatasets(listIds);
                //     });


                //     function testDatasets (listIds) {
                //         var id = listIds.splice(-1)[0];
                //         console.log('test func');
                //         Datasets.crud.get({ datasetId: id })
                //             .$promise.then(function (dataset) {
                //                 console.log(dataset)
                //                 return dataset._id;
                //             })
                //             .then(Datasets.getDatasetWithS3.bind(Datasets))
                //             .then(function (data) {
                //                 if ( !data || (data && data.hasOwnProperty('columns') && !data.columns.length) ) {
                                    
                //                     testData.push(id);
                //                     console.log('iterate data',testData);
                                    
                //                 }
                //                 if ( listIds.length ) testDatasets(listIds);
                //                 else console.log(testData);
                //             });

                //     }

                // }

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

                vm.saveChanges = function (tableData, container) {
                    var checkedColumns = vm[container].checkedColumns;
                    var columns = checkedCol(container);
                    console.log(columns,checkedColumns, vm[container]);
                    if (columns.length && vm[container].columns.length > columns.length) {
                        // Datasets.saveCustom({id:tableData._id,columns:columns});
                        var curDataset = getUserDatasetById(vm[container]._id);
                        var operationData = {
                            id: tableData._id,
                            columns: columns,
                            action: 'show'
                        };

                        vm.showActionModal('save', {title:curDataset ? curDataset.title : null}, operationData);

                    } else {
                        console.info('No data to send');
                        vm.showMessage({type:'alert',msg:['Not enought data to save dataset']});
                    }
                };

                vm.showMessage = function (dataset) {
                    if (dataset) {
                        var modalInstance = $modal.open({
                            templateUrl: 'modules/datasets/client/workbench/datasets.workbench.modal.html',
                            controller: 'DatasetsWorkbenchModalController',
                            controllerAs: 'DatasetWorkbenchModal',
                            size: 'md',
                            resolve: {
                                mergeData: dataset
                            }
                        });
                    }
                };

                vm.showActionModal = function (type,tableData,operationData) {
                    // console.log(type);
                    var modalInstance = $modal.open({
                        templateUrl: 'modules/datasets/client/workbench/action.workbench.modal.html',
                        controller: 'WorkbenchActionModalCtrl',
                        controllerAs: 'ActionModalCtrl',
                        size: 'lg',
                        resolve: {
                            modalData: {type:type,tableData:tableData,operationData:operationData}
                        }
                    });
                    
                };

                vm.mergeColumns = function () {
                    var params = vm.mergeParams;
                    var ids = window.location.pathname.split('/').slice(-2);
                    var tablesIds = {ds1:ids[0],ds2:ids[1]};
                    var msg = {msg:'',type:'alert'};
                    var operationData = {
                        params: {
                            type: +vm.mergeParams.type,
                            action: 'show'
                        },
                        datasets: createDatasets(params, tablesIds),
                    };

                    var isErrObj = checkMergeData(params,operationData);
                    if (isErrObj) {
                        isErrObj.type = 'alert';
                        vm.showMessage(isErrObj);
                        return;
                    } else {
                        var curDataset = getUserDatasetById(operationData.datasets[0].id);
                        vm.showActionModal('merge',{title:curDataset ? curDataset.title : null},operationData);
                    }

                };

            function checkMergeData (params, data) {
                    var err = {msg:[]};

                    switch (true) {
                        case (_.isEmpty(params)):
                            err.msg.push('Please check merge parameters');
                            return err;
                        case (params.type !== '0' && params.type !== '1'):
                            err.msg.push('Please check merge type');
                            return err;
                        case (!params.primaryTable):
                            err.msg.push('Please check primary table for merge');
                            return err;
                    }

                    for (var i = 0; i < data.datasets.length; i++) {
                        var isError = false;
                        if (!data.datasets[i].primary) {
                            err.msg.push('Please check primary column in both tables');
                            isError = true;
                        }
                        // console.log(params, data);
                        if (data.datasets[i].cols.length <= 1) {
                            err.msg.push('Please check columns for merge in both tables (min 2 checked columns in the each table)');
                            isError = true;
                        }
                        
                        if (isError) return err;
                    }
                    return err.msg.length ? err : false;
                 }

                function createDatasets (params, tables) {
                    var datasets = [];
                    if (_.isEmpty(params)) return;

                    for (var tableName in tables) {
                        if (tables.hasOwnProperty(tableName)) {

                            var dataObj = {
                                id: tables[tableName],
                                cols: checkedCol(tableName),
                                primary: params.hasOwnProperty('primaryCol') && params.primaryCol[tableName]
                            };

                            // if cheked primary column and no other column cheked, add primary column name to columns array
                            if (dataObj.primary && (dataObj.cols.length <= 1 && dataObj.cols.indexOf(dataObj.primary) < 0)) {
                                dataObj.cols.push(dataObj.primary);
                            }
                            if (+dataObj.id === +tables[params.primaryTable]) {
                                datasets.splice(0,0,dataObj); // add primary table to array [0]
                            } else {
                                datasets.push(dataObj);
                            }
                        }
                    }

                    return datasets;
                }

                function splitColName(column) {
                    if (!column && typeof column !== 'string') return false;
                    return column.split('_');
                }

                function getColNameForTable (colName, columnsObj, tableName) {
                    var pathOfColName = splitColName(colName);
                    return (pathOfColName[1] === tableName) && columnsObj[colName] && pathOfColName[0];
                }

                function getUserDatasetById (id) {
                    return _.find(vm.usersDatasets,{_id:id});
                }

                function checkedCol (tableName) {
                    var checkedColumns = vm[tableName].checkedColumns;
                    var columns = [];
                    for (var col in checkedColumns) {
                        if (checkedColumns.hasOwnProperty(col) && checkedColumns[col]) columns.push(col);
                    }
                    return columns; 
                }

                function clearPrimaryCol (container) {
                    if (vm.mergeParams.hasOwnProperty('primaryCol') && vm.mergeParams.primaryCol.hasOwnProperty(container)) vm.mergeParams.primaryCol[container] = null;
                }


            }]);
'use strict';

//Datasets Detail Controller
angular.module('datasets')
    .controller('DatasetsWorkbenchModalController',
        ['$modalInstance', 'mergeData',
            function ($modalInstance, mergeData) {
                var vm = this;
                vm.mergeData = mergeData;
                vm.msgType = mergeData.type;
                vm.isAlert = (function () {
                    if (vm.msgType === 'alert') {
                        return true;
                    } else if (vm.msgType === 'info') {
                        return false;
                    }
                })();

                vm.ok = function () {
                    $modalInstance.close(true);
                };

                vm.cancel = function () {
                    $modalInstance.dismiss(false);
                };

                
            }]);

(function () {
  'use strict';
  angular.module('models').run(menuConfig);
  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Models',
      state: 'models.list',
      roles: ['user'],
      position: 3
    });
    /*
        // Add the dropdown list item
        Menus.addSubMenuItem('topbar', 'models', {
          title: 'List Models',
          state: 'models.list'
        });

        // Add the dropdown create item
        Menus.addSubMenuItem('topbar', 'models', {
          title: 'Create Model',
          state: 'models.create',
          roles: ['user']
        });
    */
  }
})();

(function () {
  'use strict';

  angular
    .module('models')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('models', {
        abstract: true,
        url: '/models',
        template: '<ui-view/>'
      })
      .state('models.list', {
        url: '',
        templateUrl: 'modules/models/client/views/list-models.client.view.html',
        controller: 'ModelsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Models List'
        }
      })
      .state('models.create', {
        url: '/create',
        templateUrl: 'modules/models/client/views/form-model.client.view.html',
        controller: 'ModelsController',
        controllerAs: 'vm',
        resolve: {
          modelResolve: newModel
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Models Create'
        }
      })
      .state('models.edit', {
        url: '/:modelId/edit',
        templateUrl: 'modules/models/client/views/form-model.client.view.html',
        controller: 'ModelsController',
        controllerAs: 'vm',
        resolve: {
          modelResolve: getModel
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Model {{ modelResolve.name }}'
        }
      })
      .state('models.view', {
        url: '/:modelId',
        templateUrl: 'modules/models/client/views/view-model.client.view.html',
        controller: 'ModelsController',
        controllerAs: 'vm',
        resolve: {
          modelResolve: getModel
        },
        data:{
          pageTitle: 'Model {{ postResolve.name }}'
        }
      });
  }

  getModel.$inject = ['$stateParams', 'ModelsService'];

  function getModel($stateParams, ModelsService) {
    return ModelsService.get({
      modelId: $stateParams.modelId
    }).$promise;
  }

  newModel.$inject = ['ModelsService'];

  function newModel(ModelsService) {
    return new ModelsService();
  }
})();

(function () {
  'use strict';

  angular
    .module('models')
    .controller('ModelsListController', ModelsListController);

  ModelsListController.$inject = ['ModelsService'];

  function ModelsListController(ModelsService) {
    var vm = this;

    vm.models = ModelsService.query();
  }
})();

(function () {
  'use strict';

  // Models controller
  angular
    .module('models')
    .controller('ModelsController', ModelsController);

  ModelsController.$inject = ['$scope', '$state', 'Authentication', 'modelResolve'];

  function ModelsController ($scope, $state, Authentication, model) {
    var vm = this;

    vm.authentication = Authentication;
    vm.model = model;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Model
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.model.$remove($state.go('models.list'));
      }
    }

    // Save Model
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.modelForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.model._id) {
        vm.model.$update(successCallback, errorCallback);
      } else {
        vm.model.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('models.view', {
          modelId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();

//Models service used to communicate Models REST endpoints
(function () {
  'use strict';

  angular
    .module('models')
    .factory('ModelsService', ModelsService);

  ModelsService.$inject = ['$resource'];

  function ModelsService($resource) {
    return $resource('api/models/:modelId', {
      modelId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

'use strict';

// Configuring the posts module
angular.module('posts')
    .run(['Menus', 'Authentication',
        function (Menus, Authentication) {
            
            // Add the posts dropdown item
            Menus.addMenuItem('topbar', {
                title: 'Posts',
                state: 'posts.list',
                roles: ['user'],
                position: 3
            });
/*
            // Add the dropdown list item
            Menus.addSubMenuItem('topbar', 'posts', {
                title: 'List posts',
                state: 'posts.list'
            });

            // Add the dropdown create item
            Menus.addSubMenuItem('topbar', 'posts', {
                title: 'Create posts',
                state: 'posts.create',
                roles: ['user']
            });
            
*/
        }
    ]);

'use strict';

// Setting up route
angular.module('posts')
    .config(['$stateProvider',
        function ($stateProvider) {
            var MODULE_PATH = 'modules/posts/client/';

            // posts state routing
            $stateProvider
                .state('posts', {
                    abstract: true,
                    url: '/posts',
                    template: '<ui-view/>'
                })
                .state('posts.list', {
                    url: '',
                    controller: 'postsListController',
                    controllerAs: 'postsList',
                    templateUrl: MODULE_PATH + 'list/posts.list.html'
                })
                .state('posts.create', {
                    url: '/create',
                    controller: 'postsCreateController',
                    controllerAs: 'postsCreate',
                    templateUrl: MODULE_PATH + 'create/posts.create.html',
                    data: {
                        roles: ['user', 'admin']
                    }
                })
                .state('posts.detail', {
                    url: '/:postId',
                    controller: 'postsDetailController',
                    controllerAs: 'postsDetail',
                    templateUrl: MODULE_PATH + 'detail/posts.detail.html'
                })
                .state('posts.edit', {
                    url: '/:postId/edit',
                    controller: 'postsEditController',
                    controllerAs: 'postsEdit',
                    templateUrl: MODULE_PATH + 'edit/posts.edit.html',
                    data: {
                        roles: ['user', 'admin']
                    }
                });
        }
    ]);

'use strict';

//posts Create Controller
angular.module('posts')
    .controller('postsCreateController',
        ['$scope', '$state', 'Authentication', 'Posts',
            function ($scope, $state, Authentication, Posts) {
                var vm = this;

                vm.authentification = Authentication;
                vm.post = new Posts();

                // Create new post
                vm.create = function (isValid) {
                    vm.error = null;

                    if (!isValid) {
                        $scope.$broadcast('show-errors-check-validity', 'postForm');

                        return false;
                    }

                    // Redirect after save
                    vm.post.$save(function (response) {
                        $state.go('posts.detail', { postId: response._id });

                    }, function (errorResponse) {
                        vm.error = errorResponse.data.message;
                    });
                };
            }]);

'use strict';

//posts Detail Controller
angular.module('posts')
    .controller('postsDetailController',
        ['$stateParams', 'Authentication', 'posts',
            function ($stateParams, Authentication, posts) {
                var vm = this;

                vm.authentication = Authentication;

                vm.post = posts.get({
                    postId: $stateParams.postId
                });

                console.log(vm.authentication);
                console.log(vm.post);

            }]);

'use strict';

//posts Edit Controller
angular.module('posts')
    .controller('postsEditController',
        ['$scope', '$state', '$stateParams', 'Authentication', 'posts',
            function ($scope, $state, $stateParams, Authentication, posts) {
                var vm = this;

                vm.authentication = Authentication;

                vm.post = posts.get({
                    postId: $stateParams.postId
                });

                vm.update = function () {

                    vm.post.$update(function () {
                        $state.go('posts.detail', { postId: vm.post._id });

                    }, function (errorResponse) {
                        vm.error = errorResponse.data.message;
                    });
                };

            }]);

'use strict';

//posts List Controller
angular.module('posts')
    .controller('postsListController',
        ['$scope', '$state', 'Authentication', 'posts',
            function ($scope, $state, Authentication, posts) {
                var vm = this;

                vm.authentication = Authentication;
                vm.posts = posts.query();

            }]);

'use strict';

//posts service used for communicating with the posts REST endpoints
angular.module('posts')
    .factory('posts', ['$resource',
        function ($resource) {
            return $resource('api/posts/:postId', {
                postId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });
        }
    ]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
    function ($httpProvider) {
        // Set the httpProvider "not authorized" interceptor
        $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
            function ($q, $location, Authentication) {
                return {
                    responseError: function (rejection) {
                        switch (rejection.status) {
                            case 401:
                                // Deauthenticate the global user
                                Authentication.user = null;

                                // Redirect to signin page
                                $location.path('signin');
                                break;
                            case 403:
                                // Add unauthorized behaviour
                                break;
                        }

                        return $q.reject(rejection);
                    }
                };
            }
        ]);
    }
]);

'use strict';

// Configuring the users module
angular.module('users')
    .run(['Menus',
        function (Menus) {
            // Add the users dropdown item
            //remove user role here if want non-logged in users to be able to see menu to search users
            Menus.addMenuItem('topbar', {
                title: 'Users',
                state: 'users.list',
                roles: ['user'],
                position: 5
            });
/*
            // Add the dropdown list item
            Menus.addSubMenuItem('topbar', 'users', {
                title: 'List Users',
                state: 'users.list'
            });
*/

        }
    ]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
    function ($stateProvider) {
        var MODULE_PATH = 'modules/users/client/';
        // Users state routing
        $stateProvider
            .state('settings', {
                abstract: true,
                url: '/settings',
                templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
                data: {
                    roles: ['user', 'admin']
                }
            })

            .state('settings.profile', {
                url: '/profile',
                templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
            })

            .state('settings.password', {
                url: '/password',
                templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
            })

            .state('settings.accounts', {
                url: '/accounts',
                templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
            })

            .state('settings.picture', {
                url: '/picture',
                templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
            })

            .state('authentication', {
                abstract: true,
                url: '/authentication',
                templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html',
                controller: 'AuthenticationController'
            })

            .state('authentication.signup', {
                url: '/signup',
                templateUrl: 'modules/users/client/views/authentication/signup.client.view.html',
                controller: 'AuthenticationController'
            })

            .state('authentication.signin', {
                url: '/signin?err',
                templateUrl: 'modules/users/client/views/authentication/signin.client.view.html',
                controller: 'AuthenticationController'
            })

            .state('password', {
                abstract: true,
                url: '/password',
                template: '<ui-view/>'
            })

            .state('password.forgot', {
                url: '/forgot',
                templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
            })

            .state('password.reset', {
                abstract: true,
                url: '/reset',
                template: '<ui-view/>'
            })

            .state('password.reset.invalid', {
                url: '/invalid',
                templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
            })

            .state('password.reset.success', {
                url: '/success',
                templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
            })

            .state('password.reset.form', {
                url: '/:token',
                templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
            })

            .state('users', {
                abstract: true,
                url: '/users',
                template: '<ui-view/>'
                
            })
            .state('users.list', {
                url: '',
                controller: 'UsersListController',
                controllerAs: 'UsersList',
                templateUrl: MODULE_PATH + 'views/list/users.list.client.view.html'
                })
            .state('users.profilepage', {
                url: '/:username',
                controller: 'UsersProfilePageController',
                controllerAs: 'UsersProfilePage',
                templateUrl: MODULE_PATH + 'views/profilepage/users.profilepage.client.view.html'      
                })
            ;
            
    }
]);

'use strict';

angular.module('users').controller('AuthenticationController',
    ['$scope', '$state', '$stateParams', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
        function ($scope, $state, $stateParams, $http, $location, $window, Authentication, PasswordValidator) {
            $scope.authentication = Authentication;
            $scope.popoverMsg = PasswordValidator.getPopoverMsg();

            // Get an eventual error defined in the URL query string:
            $scope.error = $location.search().err;

            // If user is signed in then redirect back home
            if ($scope.authentication.user) {
                $location.path('/');
            }

            $scope.signup = function (isValid) {

                $scope.error = null;

                if (!isValid) {
                    console.log('hini');
                    $scope.$broadcast('show-errors-check-validity', 'userForm');

                    return false;
                }

                $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
                    // If successful we assign the response to the global user model
                    $scope.authentication.user = response;

                    // And redirect to the previous or home page
                    $state.go($state.previous.state.name || 'home', $state.previous.params);


                }).error(function (response) {
                    console.log('gg');
                    $scope.error = response.message;
                });
            };

            $scope.signin = function (isValid) {
                $scope.error = null;

                if (!isValid) {
                    $scope.$broadcast('show-errors-check-validity', 'userForm');

                    return false;
                }

                $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
                    // If successful we assign the response to the global user model
                    $scope.authentication.user = response;

                    // And redirect to the previous or home page
                    $state.go($state.previous.state.name || 'home', $state.previous.params);
                }).error(function (response) {
                    $scope.error = response.message;
                });
            };

            // OAuth provider request
            $scope.callOauthProvider = function (url) {
                if ($state.previous && $state.previous.href) {
                    url += '?redirect_to=' + encodeURIComponent($state.previous.href);
                }

                // Effectively call OAuth authentication route:
                $window.location.href = url;
            };
        }
    ]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

//users List Controller
angular.module('users')
    .controller('UsersListController',
        ['$state', '$sce', 'Authentication', 'Users', 'UsersFactory',
            function ($state, $sce, Authentication, Users, UsersFactory) {
                var vm = this;

                vm.authentication = Authentication;

                vm.search = function () {
                    UsersFactory.search(vm.q)
                        .success(function (response) {
                            vm.users = response;
                        })
                        .error(function (error) {
                            console.log(error);
                        });
                };

                vm.showTitle = function (title) {
                    var q = vm.q,
                        matcher = new RegExp(q, 'gi');
                    var highlightedTitle = title.replace(matcher, '<span class="matched">$&</span>');
                    console.log(highlightedTitle);
                    return $sce.trustAsHtml(highlightedTitle);
                };

                /*vm.addToUser = function (dataset) {
                    users.addToUserApiCall()
                        .success(function (response) {
                            console.log(response);
                        })
                        .error(function (error) {
                            console.log(error);
                        });
                };
*/
            }]);



'use strict';

angular.module('users').controller('UsersProfilePageController', 
    ['$scope', '$modal', '$http', '$location', '$stateParams', 'Users', 'UsersFactory', 'Authentication', 'Datasets', 
    function($scope, $modal, $http, $location, $stateParams, Users, UsersFactory, Authentication, Datasets) {
        var vm = this;

        vm.authentication = Authentication;
        vm.user = Authentication.user;
        vm.usersData = [];
        vm.usersDatasets = [];

        vm.isCurrentUser = function () {
      		return ($stateParams.username === vm.user.username);
        };
        
        UsersFactory.finduser($stateParams.username)
            .then(function(user) {
                vm.userData = user;
                return user;
            })
            .then(UsersFactory.finduserdatasets.bind(UsersFactory))
            .then(function(usersDatasets) {
                vm.usersDatasets = usersDatasets;
            });

        vm.addToUser = function (dataset) {
            Datasets.addToUserApiCall(dataset)
                .then(function (data) {
                    console.log(data);
                })
                .catch(function (error) {
                    console.log(error);
                });
        };
    
        vm.showEditModal = function (dataset) {
            var modalInstance = $modal.open({
                templateUrl: 'modules/datasets/client/detail/datasets.detail.modal.html',
                controller: 'DatasetsDetailModalController',
                controllerAs: 'DatasetDetailModal',
                size: 'lg',
                resolve: {
                    viewingDataset: dataset,
                    usersDatasets: function () {
                        return angular.copy(vm.usersDatasets);
                    }
                }
            });
        };
}]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
    function ($window) {
        var owasp = $window.owaspPasswordStrengthTest;

        owasp.configs = {
            minLength: 6,
            minOptionalTestsToPass: 1
        };

        owasp.tests.required = [];
        owasp.tests.optional = [
            // require at least one lowercase letter
            function(password) {
                if (!/[a-z]/.test(password)) {
                    return 'The password must contain at least one lowercase letter.';
                }
            },

            // require at least one uppercase letter
            function(password) {
                if (!/[A-Z]/.test(password)) {
                    return 'The password must contain at least one uppercase letter.';
                }
            },

            // require at least one number
            function(password) {
                if (!/[0-9]/.test(password)) {
                    return 'The password must contain at least one number.';
                }
            }
        ];

        return {
            getResult: function (password) {
                var result = owasp.test(password);
                return result;
            },
            getPopoverMsg: function () {
                var popoverMsg = 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
                return popoverMsg;
            }
        };
    }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

angular.module('users')
    .factory('UsersFactory', ['$resource', '$http',
        function ($resource, $http) {

            return {
                search: search, 
                finduser: finduser,
                finduserdatasets: finduserdatasets
            };

            function search(q) {
                return $http({
                    url: 'api/users/search?q=' + q,
                    method: 'GET'
                });
            }

            function finduser(username) {
                return $http({
                    url: 'api/users/' + username,
                    method: 'GET'
                }).then(function (res) {
                    return res.data;
                }).catch(function (err) {
                    console.log('error finding user', err);
                });
            }

            function finduserdatasets(user) {
                return $http({
                    url: 'api/datasets/user/' + user.username,
                    method: 'GET'
                }).then(function (res) {
                    return res.data;
                }).catch(function (err) {
                    console.log('error finding user datasets', err);
                });   
            }
    }]);
