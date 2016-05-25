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