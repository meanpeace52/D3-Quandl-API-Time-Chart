'use strict';

angular.module('users')
    .factory('UsersFactory', ['$resource', '$http', '$stateParams', 'Authentication',
        function ($resource, $http, $stateParams, Authentication) {

            return {
                search: search,
                finduser: finduser,
                userData: userData,
                ownership: ownership
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

            function ownership() {
                if ($stateParams.field === 'user') {
                    if ($stateParams.value == Authentication.user._id) {
                        return true;
                    }
                    else {
                        return false;
                    }
                } else {
                    return false;
                }
            }

    }]);
