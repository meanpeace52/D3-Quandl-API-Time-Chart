'use strict';

angular.module('users')
    .factory('UsersFactory', ['$resource', '$http', '$stateParams', '$q', 'Authentication',
        function ($resource, $http, $stateParams, $q, Authentication) {

            return {
                search: search,
                finduser: finduser,
                finduserpromise: finduserpromise,
                userData: userData,
                ownership: ownership
            };

            function search(q, itemsPerPage, currentPage) {
                return $http.get('api/users/search?q=' + q + '&itemsPerPage=' + itemsPerPage + '&currentPage=' + currentPage);
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

            function finduserpromise(username){
                var dfd = $q.defer();

                $http.get('api/users/' + username)
                    .success(function (data, status, headers, config) {
                        dfd.resolve(data);
                    })
                    .error(function (data, status, headers, config) {
                        dfd.reject(data);
                    });

                return dfd.promise;
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
