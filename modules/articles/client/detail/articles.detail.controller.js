'use strict';

//Articles Detail Controller
angular.module('articles')
    .controller('ArticlesDetailController',
        ['$stateParams', 'Authentication', 'Articles',
            function ($stateParams, Authentication, Articles) {
                var vm = this;

                vm.authentication = Authentication;

                vm.article = Articles.get({
                    articleId: $stateParams.articleId
                });

                console.log(vm.authentication);
                console.log(vm.article);

            }]);
