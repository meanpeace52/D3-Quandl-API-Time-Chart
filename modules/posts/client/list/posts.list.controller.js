'use strict';

//posts List Controller
angular.module('posts')
    .controller('postsListController', ['$scope', '$stateParams', '$state', 'Authentication', 'posts',
            function ($scope, $stateParams, $state, Authentication, posts) {
            var vm = this;

            vm.authentication = Authentication;
            
            var params = $stateParams.hasOwnProperty('subject');
            
            if (params) {
                posts.subject($scope.subject)
                    .success(function (response) {
                        vm.searchResults = response;
                        vm.loadingResults = false;
                    })
                    .error(function (error) {
                        vm.loadingResults = false;
                    });
            }

            }]);
