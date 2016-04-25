'use strict';

// Setting up route
angular.module('articles')
    .config(['$stateProvider',
        function ($stateProvider) {
            var MODULE_PATH = 'modules/articles/client/';

            // Articles state routing
            $stateProvider
                .state('articles', {
                    abstract: true,
                    url: '/articles',
                    template: '<ui-view/>'
                })
                .state('articles.list', {
                    url: '',
                    controller: 'ArticlesListController',
                    controllerAs: 'ArticlesList',
                    templateUrl: MODULE_PATH + 'list/articles.list.html'
                })
                .state('articles.create', {
                    url: '/create',
                    controller: 'ArticlesCreateController',
                    controllerAs: 'ArticlesCreate',
                    templateUrl: MODULE_PATH + 'create/articles.create.html',
                    data: {
                        roles: ['user', 'admin']
                    }
                })
                .state('articles.detail', {
                    url: '/:articleId',
                    controller: 'ArticlesDetailController',
                    controllerAs: 'ArticlesDetail',
                    templateUrl: MODULE_PATH + 'detail/articles.detail.html'
                })
                .state('articles.edit', {
                    url: '/:articleId/edit',
                    controller: 'ArticlesEditController',
                    controllerAs: 'ArticlesEdit',
                    templateUrl: MODULE_PATH + 'edit/articles.edit.html',
                    data: {
                        roles: ['user', 'admin']
                    }
                });
        }
    ]);
