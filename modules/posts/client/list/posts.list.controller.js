'use strict';

//posts List Controller
angular.module('posts')
    .controller('postsListController', ['$scope', '$stateParams', '$state', 'Authentication', 'posts', 'UsersFactory',
            function ($scope, $stateParams, $state, Authentication, posts, UsersFactory) {
            var vm = this;

            vm.authentication = Authentication;

            vm.state = $state.current.name;

            vm.ownership = UsersFactory.ownership();

            vm.postLimit = 10;
            
            vm.posts = [];

            vm.getPosts = function (field, value) {
                vm.posts = [];
                var getPosts;

                if (!field) {
                    // lists all posts if no filter
                    getPosts = posts.list();
                }
                else {
                    // assign field
                    vm.field = field;
                    vm.value = value;
                    getPosts = posts.search(field, value);
                }

                getPosts.then(function (posts) {
                    vm.posts = posts;
                    vm.loadingResults = false;
                }, function (err) {
                    vm.loadingResults = false;
                });
            };
            
            console.log('vm.field, vm', vm.field, vm);

            if (vm.state === 'posts.list') {
                vm.menuItems = ['finance', 'sports', 'soshsci'];
                vm.getPosts('subject',vm.menuItems[0]);
            }
            
            if (vm.state === 'posts.search'||vm.state === 'users.profilepage.posts') {
                vm.getPosts($stateParams.field, $stateParams.value);
            }

            if (vm.state === 'home') {
                vm.postLimit = 3;
                vm.menuItems = ['trending', 'in the news', 'rising'];
                vm.getPosts('trending', vm.menuItems[0]);
            }
            

            }]);
