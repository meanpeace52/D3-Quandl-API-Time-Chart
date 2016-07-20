'use strict';

// Configuring the users module
angular.module('users')
    .run(['Menus',
        function (Menus) {
            // Add the users dropdown item
            //remove user role here if want non-logged in users to be able to see menu to search users
            Menus.addMenuItem('topbar', {
                title: 'Users',
                state: 'users.list',
                roles: ['user']
            });
/*
            // Add the dropdown list item
            Menus.addSubMenuItem('topbar', 'users', {
                title: 'List Users',
                state: 'users.list'
            });
*/

        }
    ]);
