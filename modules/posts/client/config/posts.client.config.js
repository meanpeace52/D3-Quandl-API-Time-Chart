'use strict';

// Configuring the posts module
angular.module('posts')
    .run(['Menus', 'Authentication',
        function (Menus, Authentication) {

        }
    ]).constant('postOptions', {
        subjects: ['finance', 'social science'],
        access: ['public','private','paid']
    });
