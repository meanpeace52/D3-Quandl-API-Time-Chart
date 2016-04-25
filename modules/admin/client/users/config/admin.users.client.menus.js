'use strict';

angular.module('admin.users')

.run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'admin', {
            title: 'Manage Users',
            state: 'admin.users'
        });
    }
]);
