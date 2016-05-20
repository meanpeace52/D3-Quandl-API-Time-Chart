'use strict';

;(function () {
 		
  var changeTheme = function (Authentication) {
      return {
          restrict: 'A',
          link: function (scope, element, attrs) {
          	var link = document.createElement('link');
          	link.rel = "stylesheet";
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
      }
  };

  angular.module('core')
      .directive('changeTheme', ['Authentication', changeTheme]);
 
})();