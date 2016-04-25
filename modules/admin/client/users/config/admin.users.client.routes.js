'use strict';

angular.module('admin.users.routes')

    .config(['$stateProvider',
        function ($stateProvider) {
            var MODULE_PATH = 'modules/admin/client/users/';

            $stateProvider

                .state('admin.users', {
                    url: '/users',
                    templateUrl: MODULE_PATH + 'list/admin.users.list.html',
                    controller: 'AdminUserListController'
                })

                .state('admin.user', {
                    abstract: true,
                    url: '/users/:userId',
                    template: '<ui-view/>',
                    resolve: {
                        User: ['$stateParams', 'AdminUser', function ($stateParams, AdminUser) {
                            return AdminUser.get({
                                userId: $stateParams.userId
                            });
                        }]
                    }
                })

                .state('admin.user.detail', {
                    url: '',
                    templateUrl: MODULE_PATH + 'detail/admin.user.detail.html',
                    controller: 'AdminUserDetailController as AdminUserDetail'
                })

                .state('admin.user.edit', {
                    url: '/edit',
                    templateUrl: MODULE_PATH + 'edit/admin.user.edit.html',
                    controller: 'AdminUserEditController as AdminUserEdit'
                });

        }
    ]);
