'use strict';

//Articles Edit Controller
angular.module('articles')
    .controller('ArticlesEditController',
        ['$scope', '$state', '$stateParams', 'Authentication', 'Articles',
            function ($scope, $state, $stateParams, Authentication, Articles) {
                var vm = this;

                vm.authentication = Authentication;

                vm.article = Articles.get({
                    articleId: $stateParams.articleId
                });

                vm.update = function () {

                    vm.article.$update(function () {
                        $state.go('articles.detail', { articleId: vm.article._id });

                    }, function (errorResponse) {
                        vm.error = errorResponse.data.message;
                    });
                };

            }]);
