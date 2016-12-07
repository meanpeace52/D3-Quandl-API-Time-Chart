'use strict';

// Setting up route
angular.module('posts')
    .config(['$stateProvider',
        function ($stateProvider) {
            var MODULE_PATH = 'modules/posts/client/';

            // posts state routing
            $stateProvider
                .state('posts', {
                    abstract: true,
                    url: '/posts',
                    template: '<ui-view/>'
                })
                .state('posts.list', {
                    url: '',
                    controller: 'postsListController',
                    controllerAs: 'postsList',
                    templateUrl: MODULE_PATH + 'list/posts.list.html'
                })
                .state('posts.search', {
                    url: '/search/:field/:value',
                    controller: 'postsListController',
                    controllerAs: 'postsList',
                    templateUrl: MODULE_PATH + 'list/posts.list.html'
                })
                .state('posts.create', {
                    url: '/create',
                    controller: 'postsCreateController',
                    controllerAs: 'postsCreate',
                    templateUrl: MODULE_PATH + 'create/posts.create.html'
                })
                .state('posts.detail', {
                    url: '/:postId',
                    controller: 'postsDetailController',
                    controllerAs: 'postsDetail',
                    templateUrl: MODULE_PATH + 'detail/posts.detail.html'
                })
                .state('posts.edit', {
                    url: '/:postId/edit',
                    controller: 'postsEditController',
                    controllerAs: 'postsEdit',
                    templateUrl: MODULE_PATH + 'edit/posts.edit.html'
                })
                .state('posts.createstep2', {
                    url: '/:postId/create/step2',
                    controller: 'postsStep2Controller',
                    controllerAs: 'postsStep2',
                    templateUrl: MODULE_PATH + 'step2/posts.step2.html'
                })
                .state('posts.editstep2', {
                    url: '/:postId/edit/step2',
                    controller: 'postsStep2Controller',
                    controllerAs: 'postsStep2',
                    templateUrl: MODULE_PATH + 'step2/posts.step2.html'
                })
                .state('posts.external', {
                    url: '/external/{url}',
                    controller: 'postsExternalController',
                    controllerAs: 'postsExternal',
                    params: {
                        url : ''
                    },
                    templateUrl: MODULE_PATH + 'external/posts.external.html'
                });
        }
    ]);
