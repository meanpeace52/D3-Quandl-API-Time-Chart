'use strict';

angular.module('users').directive('equals', function() {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function(scope, elem, attrs, ngModel) {
      if(!ngModel) return;
      scope.$watch(attrs.ngModel, function() {
        validate();
      });
      attrs.$observe('equals', function (val) {
        validate();
      });
      function validate(){
        var val1 = ngModel.$viewValue;
        var val2 = attrs.equals;
        ngModel.$setValidity('equals', ! val1 || ! val2 || val1 === val2);
      }
    }
  };
});
