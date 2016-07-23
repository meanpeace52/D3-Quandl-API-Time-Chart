'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication','posts',
    function ($scope, Authentication, posts) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        
        $scope.menuItems = [{title: 'Finance', state: 'posts.search({field: "subject", value: "finance"})'},{title: 'Sports', state: 'posts.search({field: "subject", value: "sports"})'},{title: 'Social Science', state: 'posts.search({field: "subject", value: "social-science"})'}];
        
        $scope.subject = 'Finance';
        
        posts.search($scope.subject).then(function(res) {
           $scope.posts = res; 
        });
        
    }
]);
