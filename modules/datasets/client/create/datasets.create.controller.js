'use strict';

//Articles Create Controller
angular.module('articles')
    .controller('ArticlesCreateController',
        ['$scope', '$state', 'Authentication', 'Articles',
            function ($scope, $state, Authentication, Articles) {
                var vm = this;

                vm.authentification = Authentication;
                vm.article = new Articles();

                // Create new Article
                vm.create = function (isValid) {
                    vm.error = null;

                    if (!isValid) {
                        $scope.$broadcast('show-errors-check-validity', 'articleForm');

                        return false;
                    }

                    // Redirect after save
                    vm.article.$save(function (response) {
                        $state.go('articles.detail', { articleId: response._id });

                    }, function (errorResponse) {
                        vm.error = errorResponse.data.message;
                    });
                };
            }]);
