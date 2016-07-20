'use strict';

//posts service used for communicating with the posts REST endpoints
angular.module('posts')
    .factory('posts', ['$resource',
        function ($resource) {
            return $resource('api/posts/:postId', {
                postId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });
        }
    ]);
