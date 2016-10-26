'use strict';

//posts List Controller
angular.module('posts')
    .controller('postsListController', ['$scope', '$stateParams', '$state', 'Authentication', 'posts', 'UsersFactory', 'postOptions', 'prompt', '$log', 'toastr',
            function ($scope, $stateParams, $state, Authentication, posts, UsersFactory, postOptions, prompt, $log, toastr) {
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

            $scope.$on('$viewContentLoaded',function(event,viewName){ //listen for when the content is loaded into the view
                if (viewName === 'posts-finance@home'){
                    $scope.subject = 'finance';
                }
                else if (viewName === 'posts-soshsci@home') {
                    $scope.subject = 'soshsci';
                }
            });

            vm.search = function () {
                vm.field = 'title';
                if (vm.query) {
                    vm.getPosts(vm.field, vm.query);
                }
                else {
                    vm.getPosts();
                }
            };

            vm.confirmPurchase = function(post){
                prompt({
                    title: 'Confirm Purchase?',
                    message: 'Are you sure you want to purchase access to this post for $' + post.cost + '?'
                }).then(function(){
                    posts.purchasepost(post._id)
                        .then(function(result){
                            post.purchased = true;
                            toastr.success('Post purchased successfully.');
                        })
                        .catch(function(err){
                            $log.error(err);
                            toastr.error('Error purchasing post.');
                        });
                });
            };

            // set view based on state

            if (vm.state === 'posts.list') { // topbar view
                vm.menuItems = postOptions.subjects;
                vm.field = 'subject';
            }
            else if (vm.state === 'posts.search') {
                vm.getPosts($stateParams.field, $stateParams.value);
            }
            else if (vm.state === 'users.profilepage.posts') {
                vm.load();
                UsersFactory.userData('posts', $stateParams.username).then(function (res) {
                    vm.list = res;
                    vm.loaded();
                });
            }
            else if (vm.state === 'home') {
                vm.menuItems = ['trending in theorylab', 'in the news', 'most accurate', 'from the editor'];
                vm.getPosts('subject', $scope.subject);
            }
}]);
