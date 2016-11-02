'use strict';

// Configuring the datasets module
angular.module('datasets')
    .run(['Menus',
        function (Menus) {


/*
            // Add the dropdown list item
            Menus.addSubMenuItem('topbar', 'datasets', {
                title: 'List datasets',
                state: 'datasets.list'
            });

            // Add the dropdown create item
            Menus.addSubMenuItem('topbar', 'datasets', {
                title: 'Create datasets',
                state: 'datasets.create',
                roles: ['user']
            });
*/
            
        }
    ]).constant('datasetOptions', {
        access: ['public', 'private', 'for sale']
    });
