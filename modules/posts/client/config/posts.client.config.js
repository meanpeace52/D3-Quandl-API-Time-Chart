'use strict';

// Configuring the posts module
angular.module('posts')
    .run(['Menus', 'Authentication',
        function (Menus, Authentication) {

        }
    ]).constant('postOptions', {
        subjects: ['finance', 'soshsci'],
        access: ['public','private','for sale']
    });
