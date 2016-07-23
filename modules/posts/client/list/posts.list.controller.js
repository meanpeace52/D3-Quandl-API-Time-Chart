'use strict';

//posts List Controller
angular.module('posts')
    .controller('postsListController', ['$scope', '$stateParams', '$state', 'Authentication', 'posts',
            function ($scope, $stateParams, $state, Authentication, posts) {
            var vm = this;

            vm.authentication = Authentication;

            if ($state.current === 'posts.search') {

                var options = {};
                options[$stateParams.field] = $stateParams.value;
                posts.search(options).then(function (res) {
                    console.log('res: ', res);
                    vm.posts = res.data;
                    vm.loadingResults = false;
                }, function (err) {
                    vm.loadingResults = false;
                });
            }

            }]);
