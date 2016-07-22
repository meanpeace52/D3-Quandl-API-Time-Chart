'use strict';
//posts service used for communicating with the posts REST endpoints
angular.module('posts').factory('posts', ['$resource', '$http','$state',
    function ($resource, $http, $state) {
        var posts = {};

        posts.crud = function () {
            return $resource('api/posts/:postId', {
                postId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });
        }();
        
        posts.subject = function (subject) {
            return $http({
                url: 'api/posts/subject/' + subject,
                method: 'GET'
            });
        };
        return posts;
    }
]);
