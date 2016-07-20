'use strict';

// Configuring the posts module
angular.module('posts')
    .run(['Menus', 'Authentication',
        function (Menus, Authentication) {
            
            // Add the posts dropdown item
            Menus.addMenuItem('topbar', {
                title: 'Posts',
                state: 'posts.list',
                roles: ['user']
            });
/*
            // Add the dropdown list item
            Menus.addSubMenuItem('topbar', 'posts', {
                title: 'List posts',
                state: 'posts.list'
            });

            // Add the dropdown create item
            Menus.addSubMenuItem('topbar', 'posts', {
                title: 'Create posts',
                state: 'posts.create',
                roles: ['user']
            });
            
*/
        }
    ]);
