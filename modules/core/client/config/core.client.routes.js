'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        // Redirect to 404 when route not found
        $urlRouterProvider.otherwise('not-found');

        // Home state routing
        $stateProvider
            .state('home', {
                url: '/',
                views: {
                    '': {
                        templateUrl: 'modules/core/client/views/home.client.view.html',
                        controller: 'HomeController',
                        controllerAs: 'home'
                    },
                    'posts-finance@home': {
                        templateUrl: 'modules/posts/client/list/posts.list.html',
                        controller: 'postsListController',
                        controllerAs: 'postsList'
                    },
                    'posts-soshsci@home': {
                        templateUrl: 'modules/posts/client/list/posts.list.html',
                        controller: 'postsListController',
                        controllerAs: 'postsList'
                    }
                }
            })
            .state('not-found', {
                url: '/not-found',
                templateUrl: 'modules/core/client/views/404.client.view.html'
            });
    }
]);
