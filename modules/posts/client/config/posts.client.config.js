'use strict';

// Configuring the posts module
angular.module('posts')
    .run(['Menus', 'Authentication',
        function (Menus, Authentication) {

            // Add the posts dropdown item
            Menus.addMenuItem('topbar', {
                title: 'Posts',
                state: 'posts.list',
                roles: ['user'],
                position: 3
            });

            Menus.addMenuItem('topbar', {
                title: 'Finance',
                state: 'posts.search({field: "subject", value: "finance"})',
                roles: ['*'],
                position: 1
            });

        }
    ]).constant('postOptions', {
        subjects: ['finance', 'sports', 'social-science'],
        access: ['public','private','paid']
    });