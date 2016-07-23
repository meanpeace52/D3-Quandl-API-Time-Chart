'use strict';

//posts Detail Controller
angular.module('posts')
    .controller('postsDetailController', ['$stateParams', 'Authentication', 'posts',
            function ($stateParams, Authentication, posts) {

            var vm = this;
            
            vm.authentication = Authentication;
            
            vm.post = posts.crud.get({
                postId: $stateParams.postId
            });
            
 }]);
