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

            function userData(model, username) {
                return $http({
                    url: 'api/users/' + username + '/models/' + model,
                    method: 'GET'
                }).then(function (res) {
                    console.log('userdata: ', res);
                    return res.data;
                }).catch(function (err) {
                    console.log('error finding user', err);
                });
            }

            function ownership() {
                if ($stateParams.username === Authentication.user.username) {
                    return true;
                }
                else {
                    return false;
                }
            }

    }]);
