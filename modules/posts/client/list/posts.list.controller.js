'use strict';

//posts List Controller
angular.module('posts')
    .controller('postsListController', ['$scope', '$stateParams', '$state', 'Authentication', 'posts',
            function ($scope, $stateParams, $state, Authentication, posts) {
            var vm = this;

            vm.authentication = Authentication;

            var subject = $stateParams.hasOwnProperty('subject');

            if (subject) {
                posts.subject($stateParams.subject)
                    .success(function (response) {
                        vm.posts = response.data;
                        vm.loadingResults = false;
                    })
                    .error(function (error) {
                        vm.loadingResults = false;
                    });
            }

            }]);
