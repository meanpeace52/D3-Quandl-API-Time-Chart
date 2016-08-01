'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
    function ($stateProvider) {
        var MODULE_PATH = 'modules/users/client/';
        // Users state routing

        var profileParams = {
            field: {
                value: '',
                squash: true
            },
            value: {
                value: '',
                squash: true
            }
        };
        
        $stateProvider
            .state('settings', {
                abstract: true,
                url: '/settings',
                templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
                data: {
                    roles: ['user', 'admin']
                }
            })
            .state('settings.profile', {
                url: '/profile',
                templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
            })

        .state('settings.password', {
            url: '/password',
            templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
        })

        .state('settings.accounts', {
            url: '/accounts',
            templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
        })

        .state('settings.picture', {
            url: '/picture',
            templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
        })

        .state('authentication', {
            abstract: true,
            url: '/authentication',
            templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html',
            controller: 'AuthenticationController'
        })

        .state('authentication.signup', {
            url: '/signup',
            templateUrl: 'modules/users/client/views/authentication/signup.client.view.html',
            controller: 'AuthenticationController'
        })

        .state('authentication.signin', {
            url: '/signin?err',
            templateUrl: 'modules/users/client/views/authentication/signin.client.view.html',
            controller: 'AuthenticationController'
        })

        .state('password', {
            abstract: true,
            url: '/password',
            template: '<ui-view/>'
        })

        .state('password.forgot', {
            url: '/forgot',
            templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
        })

        .state('password.reset', {
            abstract: true,
            url: '/reset',
            template: '<ui-view/>'
        })

        .state('password.reset.invalid', {
            url: '/invalid',
            templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
        })

        .state('password.reset.success', {
            url: '/success',
            templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
        })

        .state('password.reset.form', {
            url: '/:token',
            templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
        })

        .state('users', {
                abstract: true,
                url: '/users',
                template: '<ui-view/>'

            })
            .state('users.list', {
                url: '',
                controller: 'UsersListController',
                controllerAs: 'UsersList',
                templateUrl: MODULE_PATH + 'views/list/users.list.client.view.html'
            })
            .state('users.profilepage', {
                url: '/:username',
                controller: 'UsersProfilePageController',
                controllerAs: 'UsersProfilePage',
                templateUrl: MODULE_PATH + 'views/profilepage/users.profilepage.client.view.html'
            }).state('users.profilepage.posts', {
                url: '/posts',
                params: profileParams,
                controller: 'postsListController',
                controllerAs: 'postsList',
                templateUrl: 'modules/posts/client/list/posts.list.html'
            }).state('users.profilepage.models', {
                url: '/models',
                params: profileParams,
                controller: 'ModelsListController',
                controllerAs: 'vm',
                templateUrl: 'modules/models/client/views/list-models.client.view.html'
            }).state('users.profilepage.data', {
                url: '/data',
                params: profileParams,
                controller: 'DatasetsListController',
                controllerAs: 'DatasetsList',
                templateUrl: 'modules/datasets/client/list/datasets.list.html'
            });

    }
]);