'use strict';

//posts List Controller
angular.module('posts')
    .controller('postsListController', ['$scope', '$stateParams', '$state',
            function ($scope, $stateParams, $state, Authentication, posts) {
            var vm = this;

            vm.authentication = Authentication;

            vm.postLimit = 10;

            // for conditional in posts.list.html to minimize view files
            vm.state = $state.current.name;

            if (vm.state === 'posts.list') {
                posts.list().then(function (posts) {
                    vm.posts = posts;
                    console.log('posts: ', vm.posts);

                }, function (err) {
                    vm.loadingResults = false;
                    console.log('err: ', err);
                });
            }

            vm.search = function (field, value) {
                if (vm.state === 'home') {
                    vm.subject = value;
                }
                vm.posts = [];
                posts.search(field, value).then(function (posts) {
                    vm.posts = posts;
                    vm.loadingResults = false;
                }, function (err) {
                    vm.loadingResults = false;
                });
            };

            if (vm.state === 'posts.search') {
                vm.search($stateParams.field, $stateParams.value);
            }

            // nested page in home state
            if (vm.state === 'home') {

                vm.postLimit = 3;

                vm.menuItems = ['finance', 'sports', 'social science'];

                vm.search('subject', 'finance');

            }
            
            }]);
