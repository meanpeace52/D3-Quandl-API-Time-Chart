'use strict';

angular.module('admin.users')

.factory('AdminUser', ['$resource',
    function ($resource) {
        return $resource('api/users/:userId', {
            userId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
