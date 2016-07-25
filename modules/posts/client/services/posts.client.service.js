'use strict';
//posts service used for communicating with the posts REST endpoints
angular.module('posts').factory('posts', ['$resource', '$http', '$state',
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

        posts.create = function (content) {
            return $http.post('/api/posts', content).then(function (res) {
                return res.data;
            }, function (err) {
                return err.data;
            });
        };
        
        posts.list = function() {
            return $http.get('/api/posts').then(function(res) {
                return res.data;      
            }, function(err) {
                return err.data;
            });
        };
        
        posts.filter = function (field, value) {
            var filter = field + '/' + value;
            return $http.get('api/posts/filter/' + filter).then(function (res) {
                return res.data;
            }, function (err) {
                return err.data;
            });
        };

        return posts;
    }
]);
