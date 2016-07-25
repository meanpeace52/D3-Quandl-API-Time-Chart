'use strict';

angular.module('users')
    .factory('UsersFactory', ['$resource', '$http',
        function ($resource, $http) {

            return {
                search: search,
                finduser: finduser,
                userData: userData
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

            function userData(data, username) {
                return $http({
                    url: 'api/' + data + '/username/' + username,
                    method: 'GET'
                }).then(function (res) {
                    return res.data;
                }).catch(function (err) {
                    console.log('error finding user', err);
                });
            }

    }]);
