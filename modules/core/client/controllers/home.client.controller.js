'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
    function ($scope, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        
        $scope.menuItems = [{title: 'Finance', state: 'posts.search({field: "subject", value: "finance"})'},{title: 'Sports', state: 'posts.search({field: "subject", value: "sports"})'},{title: 'Social Science', state: 'posts.search({field: "subject", value: "social-science"})'}];
        
    }
]);
