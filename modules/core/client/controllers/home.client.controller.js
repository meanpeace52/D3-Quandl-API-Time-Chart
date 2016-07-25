'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication','posts',
    function ($scope, Authentication, posts) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
    }
]);
