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
            state: 'posts.subject({subject: "finance"})',
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
