'use strict';

//posts Edit Controller
angular.module('posts')
    .controller('postsExternalController', ['$scope', '$state', '$stateParams', 'Authentication', 'posts', 'toastr', '$log', '$sce',
            function ($scope, $state, $stateParams, Authentication, posts, toastr, $log, $sce) {
            var vm = this;

            vm.user = Authentication.user;

            posts.getRepubhubFeedArticle($stateParams.url)
                .then(function(html){
                    vm.html = $sce.trustAsHtml(html);
                })
                .catch(function(err){
                    $log.error(err);
                    toastr.error('Error loading news article.');
                });

    }]);
