'use strict';

angular.module('core').controller('HeaderController', ['$rootScope', '$scope', '$state', 'Authentication', 'Menus',
    function ($rootScope, $scope, $state, Authentication, Menus) {
        // Expose view variables
        $scope.$state = $state;
        $scope.authentication = Authentication;

        // Get the  menu
        $scope.menu = Menus.getMenu('topbar');

        Menus.addMenuItem('topbar', {
            title: 'TheoryLab',
            state: 'home',
            roles: ['*'],
            position: 0
        });

        // Add the datasets dropdown item
        Menus.addMenuItem('topbar', {
            title: 'Datasets',
            state: 'datasets.list',
            roles: ['user'],
            position: 1
        });


        Menus.addMenuItem('topbar', {
            title: 'Models',
            state: 'models.list',
            roles: ['user'],
            position: 2
        });

        Menus.addMenuItem('topbar', {
            title: 'Users',
            state: 'users.list',
            roles: ['user'],
            position: 3
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
