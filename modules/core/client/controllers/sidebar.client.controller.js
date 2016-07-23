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
          if (newVal && newVal.hasOwnProperty('username')) {
            $rootScope.isToggleSideBar = true;

            Menus.addMenuItem('sidebar', {
              title: 'My Posts',
              state: 'posts.search({ field: "username" , value: "' + newVal.username + '"})',
              faIcon: 'fa-file',
              roles: ['user'],
              position: 1
            });
            // Add the My Data sidebar item
            Menus.addMenuItem('sidebar', {
              title: 'My Data',
              state: 'users.profilepage({ username: "' + newVal.username + '" })',
              faIcon: 'fa-line-chart',
              roles: ['user'],
              position: 2
            });
            Menus.addMenuItem('sidebar', {
              title: 'My Models',
              state: 'models.search({field: "username" , value: "' + newVal.username + '"})',
              faIcon: 'fa-cogs',
              roles: ['user'],
              position: 3
            });
          }
        });

		}
]);
