'use strict';

//posts Detail Controller
angular.module('posts')
    .controller('postsDetailController',
        ['$stateParams', 'Authentication', 'posts',
            function ($stateParams, Authentication, posts) {
                var vm = this;

                vm.authentication = Authentication;

                vm.post = posts.get({
                    postId: $stateParams.postId
                });

                console.log(vm.authentication);
                console.log(vm.post);

            }]);
