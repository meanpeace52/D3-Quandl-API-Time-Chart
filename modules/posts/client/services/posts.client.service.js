'use strict';
//posts service used for communicating with the posts REST endpoints
angular.module('posts').factory('posts', ['$resource', '$http', '$state', '$q',
    function ($resource, $http, $state, $q) {

        var posts = {};

        posts.crud = function () {
            return $resource('api/posts/:postId', {
                postId: '@postId'
            }, {
                update: {
                    method: 'PUT'
                }
            });
        }();

        posts.create = function (content) {
            var dfd = $q.defer();

            $http.post('/api/posts', content)
                .success(function (data, status, headers, config) {
                    dfd.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    dfd.reject({ status : status, message : data });
                });

            return dfd.promise;
        };

        posts.trackpostview = function (id) {
            var dfd = $q.defer();

            $http.post('/api/trackpostview/' + id)
                .success(function (data, status, headers, config) {
                    dfd.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    dfd.reject(data);
                });

            return dfd.promise;
        };

        posts.purchasepost = function (id) {
            var dfd = $q.defer();

            $http.post('/api/purchasepost/' + id)
                .success(function (data, status, headers, config) {
                    dfd.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    dfd.reject(data);
                });

            return dfd.promise;
        };
        
        posts.list = function() {
            return $http.get('/api/posts').then(function(res) {
                return res.data;      
            }, function(err) {
                return err.data;
            });
        };
        
        posts.search = function (field, value) {
            var search = field + '/' + value;
            return $http.get('/api/posts/search/' + search).then(function (res) {
                return res.data;
            }, function (err) {
                return err.data;
            });
        };

        return posts;
    }
]);
