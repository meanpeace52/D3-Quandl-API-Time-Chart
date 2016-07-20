'use strict';

//posts List Controller
angular.module('posts')
    .controller('postsListController',
        ['$scope', '$state', 'Authentication', 'posts',
            function ($scope, $state, Authentication, posts) {
                var vm = this;

                vm.authentication = Authentication;
                vm.posts = posts.query();

            }]);
