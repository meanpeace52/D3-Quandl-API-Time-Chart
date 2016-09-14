'use strict';

//posts List Controller
angular.module('posts')
    .controller('postsListController', ['$scope', '$stateParams', '$state', 'Authentication', 'posts', 'UsersFactory', 'postOptions',
            function ($scope, $stateParams, $state, Authentication, posts, UsersFactory, postOptions) {
            var vm = this;

            vm.authentication = Authentication;

            vm.state = $state.current.name;

            vm.ownership = UsersFactory.ownership();

            vm.showCreate = $state.current.name == 'posts.list';

            vm.postLimit = 10;

            vm.resolved = false;
            vm.loading = false;

            vm.load = function () {
                vm.resolved = false;
                vm.loading = true;
            };

            vm.loaded = function () {
                vm.resolved = true;
                vm.loading = false;
            };

            vm.getPosts = function (field, value) {
                vm.load();

                vm.list = [];
                var getPosts;

                if (!field) {
                    // lists all posts if no filter
                    getPosts = posts.list();
                }
                else {
                    vm.field = field;
                    vm.value = value;
                    if (vm.field !== 'title') {
                        vm.query = ''; // remove query if a title was searched but category selected
                    }
                    getPosts = posts.search(field, value);
                }

                getPosts.then(function (posts) {
                    vm.list = posts;
                    vm.loaded();
                }, function (err) {
                    vm.loaded();
                });
            };


            vm.search = function () {
                vm.field = 'title';
                if (vm.query) {
                    vm.getPosts(vm.field, vm.query);
                }
                else {
                    vm.getPosts();
                }

            };

            // set view based on state

            if (vm.state === 'posts.list') { // topbar view
                vm.menuItems = postOptions.subjects;
                vm.field = 'subject';
            }

            if (vm.state === 'posts.search') {
                vm.getPosts($stateParams.field, $stateParams.value);
            }

            if (vm.state === 'users.profilepage.posts') {
                vm.load();
                UsersFactory.userData('posts', $stateParams.username).then(function (res) {
                    vm.list = res;
                    vm.loaded();
                });
            }

            if (vm.state === 'home') {
                vm.postLimit = 3;
                vm.menuItems = ['trending', 'in the news', 'rising'];
                vm.getPosts('trending', vm.menuItems[0]);
            }
}]);
