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
              if ( isToggle === 'toggle' || curState !== 'home' ) {
                toggleContainer(newValue);
              }
            });

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
              curState = toState.name;
              if ( curState === 'home' ) {
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
      }
  };

  angular.module('core')
      .directive('isNeedContainer', ['$rootScope', '$window', '$timeout', isNeedContainer]);
 
})();