'use strict';

angular.module('core')
  .controller('SideBarCtrl', ['$rootScope', '$scope', 'Authentication', 'Menus',
		function ($rootScope, $scope, Authentication, Menus) {

      $scope.authentication = Authentication;
      $scope.user = Authentication.user;
      $scope.sidebarMenu = Menus.getMenu('sidebar');

      // Add the Lab sidebar item
      Menus.addMenuItem('sidebar', {
        title: 'Lab',
        state: 'lab.process',
        type: 'item',
        faIcon: 'fa-flask',
        roles: ['user'],
        position: 0
      });

      // Add the Posts sidebar item

      $scope.$watch(
        function () {
          return Authentication.user;
        },
        function (newVal) {
          if (newVal && newVal.hasOwnProperty('_id')) {
            $rootScope.isToggleSideBar = true;

            Menus.addMenuItem('sidebar', {
              title: 'My Posts',
              state: 'users.profilepage.posts({username: \'' + newVal.username + '\'})',
              faIcon: 'fa-file',
              roles: ['user'],
              position: 1
            });
            
            // Add the My Data sidebar item
            Menus.addMenuItem('sidebar', {
              title: 'My Datasets',
              state: 'users.profilepage.datasets({ username: \'' + newVal.username + '\'})',
              faIcon: 'fa-line-chart',
              roles: ['user'],
              position: 2
            });
            
            Menus.addMenuItem('sidebar', {
              title: 'My Models',
              state: 'users.profilepage.models({ username: \'' + newVal.username + '\'})',
              faIcon: 'fa-cogs',
              roles: ['user'],
              position: 3
            });
          }
        });

		}
]);
