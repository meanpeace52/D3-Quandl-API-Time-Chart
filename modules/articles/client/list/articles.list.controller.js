'use strict';

//Articles List Controller
angular.module('articles')
    .controller('ArticlesListController',
        ['$scope', '$state', 'Authentication', 'Articles',
            function ($scope, $state, Authentication, Articles) {
                var vm = this;

                vm.authentication = Authentication;
                vm.articles = Articles.query();

            }]);
