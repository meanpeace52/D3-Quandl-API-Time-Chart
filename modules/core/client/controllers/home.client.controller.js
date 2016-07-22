'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
    function ($scope, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        
        $scope.subjects = [{title: 'Finance', subject: 'finance'},{title: 'Sports', subject: 'sports'},{title: 'Social Science', subject: 'social-science'}];
        
    }
]);
