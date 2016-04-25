'use strict';

angular.module('users')
    .factory('UsersFactory', ['$resource', '$http',
        function ($resource, $http) {

            return {
                search: search, 
                finduser: finduser,
                finduserdatasets: finduserdatasets
            };

            function search(q) {
                return $http({
                    url: 'api/users/search?q=' + q,
                    method: 'GET'
                });
            }

            function finduser(username) {
                return $http({
                    url: 'api/users/' + username,
                    method: 'GET'
                }).then(function (res) {
                    return res.data;
                }).catch(function (err) {
                    console.log('error finding user', err);
                });
            }

            function finduserdatasets(user) {
                return $http({
                    url: 'api/datasets/user/' + user.username,
                    method: 'GET'
                }).then(function (res) {
                    return res.data;
                }).catch(function (err) {
                    console.log('error finding user datasets', err);
                });   
            }
    }]);
