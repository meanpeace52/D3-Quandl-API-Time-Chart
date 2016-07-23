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
        
        posts.create = function(content) {
            return $http.post('/api/posts', content).then(function(success) {
                return success.data;
            } ,function(err) {
                return err.data;
            });
        };
        
        posts.search = function (search) {
            return $http.get('api/posts/' + search).then(function (success) {
                return success;
            }, function(err) {
                return err;
            });
        };
        
        return posts;
    }
]);
