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
