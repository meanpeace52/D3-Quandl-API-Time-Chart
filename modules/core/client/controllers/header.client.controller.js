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
            state: 'posts.search({field: "subject", value: "finance"})',
            roles: ['*'],
            position: 1
        });

        // Add the datasets dropdown item
        Menus.addMenuItem('topbar', {
            title: 'Datasets',
            state: 'datasets.list',
            roles: ['user'],
            position: 2
        });


        Menus.addMenuItem('topbar', {
            title: 'Models',
            state: 'models.list',
            roles: ['user'],
            position: 3
        });

        // Add the posts dropdown item
        Menus.addMenuItem('topbar', {
            title: 'Posts',
            state: 'posts.list',
            roles: ['user'],
            position: 3
        });

        Menus.addMenuItem('topbar', {
            title: 'Users',
            state: 'users.list',
            roles: ['user'],
            position: 5
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
