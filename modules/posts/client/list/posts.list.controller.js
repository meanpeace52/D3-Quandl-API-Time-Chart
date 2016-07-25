'use strict';

//posts List Controller
angular.module('posts')
    .controller('postsListController', ['$scope', '$stateParams', '$state', 'Authentication', 'posts',
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


            if (vm.state === 'posts.filter') {
                filterPosts($stateParams.field, $stateParams.value);
            }

            // nested page in home state
            if (vm.name === 'home') {

                vm.postLimit = 3;

                vm.menuItems = [{
                    title: 'Finance',
                    state: 'postsList.posts.filter({field: "subject", value: "finance"})'
                }, {
                    title: 'Sports',
                    state: 'postsList.posts.filter({field: "subject", value: "sports"})'
                }, {
                    title: 'Social Science',
                    state: 'postsList.posts.filter({field: "subject", value: "social-science"})'
                }];

                filterPosts('subject', 'finance');

            }
            
            function filterPosts(field, value) {

                posts.filter(field, value).then(function (posts) {
                    vm.posts = posts;
                    vm.loadingResults = false;
                }, function (err) {
                    vm.loadingResults = false;
                });
            }

            }]);
