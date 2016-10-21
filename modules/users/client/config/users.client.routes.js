'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
    function ($stateProvider) {
        var MODULE_PATH = 'modules/users/client/';
        // Users state routing
        $stateProvider
        .state('settings', {
            abstract: true,
            url: '/settings',
            templateUrl: MODULE_PATH + 'views/settings/settings.client.view.html',
            data: {
                roles: ['user', 'admin']
            }
        })
          .state('settings.profile', {
              url: '/profile',
              templateUrl: MODULE_PATH + 'views/settings/edit-profile.client.view.html'
          })
          .state('settings.password', {
              url: '/password',
              templateUrl: MODULE_PATH + 'views/settings/change-password.client.view.html'
          })
          .state('settings.accounts', {
              url: '/accounts',
              templateUrl: MODULE_PATH + 'views/settings/manage-social-accounts.client.view.html'
          })
          .state('settings.picture', {
              url: '/picture',
              templateUrl: MODULE_PATH + 'views/settings/change-profile-picture.client.view.html'
          })
          .state('settings.subscription', {
              url: '/subscription',
              templateUrl: MODULE_PATH + 'views/settings/subscription.client.view.html'
          })
          .state('settings.invoices', {
              url: '/invoices',
              templateUrl: MODULE_PATH + 'views/settings/invoices.client.view.html'
          })
          .state('settings.billing', {
              url: '/billing',
              templateUrl: MODULE_PATH + 'views/settings/billing.client.view.html'
          })
          .state('settings.gettingpaid', {
              url: '/gettingpaid',
              templateUrl: MODULE_PATH + 'views/settings/gettingpaid.client.view.html'
          })

        .state('pricing', {
            url: '/pricing',
            templateUrl: MODULE_PATH + 'views/pricing/pricing.client.view.html'
        })
        
        .state('authentication', {
            abstract: true,
            url: '/authentication',
            templateUrl: MODULE_PATH + 'views/authentication/authentication.client.view.html',
            controller: 'AuthenticationController'
        })
          .state('authentication.signup', {
              url: '/signup',
              templateUrl: MODULE_PATH + 'views/authentication/signup.client.view.html',
              controller: 'AuthenticationController'
          })
          .state('authentication.signin', {
              url: '/signin?err',
              templateUrl: MODULE_PATH + 'views/authentication/signin.client.view.html',
              controller: 'AuthenticationController'
          })

        .state('emailverification', {
            url: '/emailverification',
            templateUrl: MODULE_PATH + 'views/emailverification/emailverification.client.view.html'
        })
          .state('emailverification.invalid', {
              url: '/invalid',
              templateUrl: MODULE_PATH + 'views/emailverification/emailverification-invalid.client.view.html'
          })
          .state('emailverification.success', {
              url: '/success',
              templateUrl: MODULE_PATH + 'views/emailverification/emailverification-success.client.view.html'
          })

        .state('password', {
            abstract: true,
            url: '/password',
            template: '<ui-view/>'
        })
          .state('password.forgot', {
              url: '/forgot',
              templateUrl: MODULE_PATH + 'views/password/forgot-password.client.view.html'
          })
          .state('password.reset', {
              abstract: true,
              url: '/reset',
              template: '<ui-view/>'
          })
          .state('password.reset.invalid', {
              url: '/invalid',
              templateUrl: MODULE_PATH + 'views/password/reset-password-invalid.client.view.html'
          })
          .state('password.reset.success', {
              url: '/success',
              templateUrl: MODULE_PATH + 'views/password/reset-password-success.client.view.html'
          })
          .state('password.reset.form', {
              url: '/:token',
              templateUrl: MODULE_PATH + 'views/password/reset-password.client.view.html'
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
              templateUrl: MODULE_PATH + 'views/profilepage/users.profilepage.client.view.html',
          }).state('users.profilepage.posts', {
              url: '/posts',
              controller: 'postsListController',
              controllerAs: 'postsList',
              templateUrl: 'modules/posts/client/list/posts.list.html',
          }).state('users.profilepage.models', {
              url: '/models',
              controller: 'ModelsListController',
              controllerAs: 'vm',
              templateUrl: 'modules/models/client/views/list-models.client.view.html'
          }).state('users.profilepage.datasets', {
              url: '/data',
              controller: 'DatasetsListController',
              controllerAs: 'DatasetsList',
              templateUrl: 'modules/datasets/client/list/datasets.list.html'
          });

    }
]);
