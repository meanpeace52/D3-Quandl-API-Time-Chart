'use strict';

//posts Edit Controller
angular.module('posts')
    .controller('postsExternalController', ['$scope', '$state', '$stateParams', 'Authentication', 'posts', 'toastr', '$log', '$sce',
            function ($scope, $state, $stateParams, Authentication, posts, toastr, $log, $sce) {
            var vm = this;

            vm.user = Authentication.user;


            posts.getRepubhubFeedArticle($stateParams.url)
                .then(function(article){
                    //vm.article = $sce.trustAsHtml(html);
                    vm.article = article;
                    vm.title = $sce.trustAsHtml(article.title);
                    vm.html = $sce.trustAsHtml(article.html);
                })
                .catch(function(err){
                    $log.error(err);
                    toastr.error('Error loading news article.');
                });

    }]);
