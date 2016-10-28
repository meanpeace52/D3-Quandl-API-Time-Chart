'use strict';

angular.module('datasets')
    .factory('Datasets', ['$resource', '$http', '$q',
        function ($resource, $http, $q) {

            return {
                crud: crud(),
                create: create,
                update: update,
                remove: remove,
                search: search,
                filter: filter,
                purchaseDataset: purchaseDataset,
                addToUserApiCall: addToUserApiCall,
                getDatasetWithS3: getDatasetWithS3,
                saveCustom: saveCustom,
                mergeColumns: mergeColumns,
                insert: insert,
                user: user
            };

            function crud() {
                return $resource('api/datasets/:datasetId', {
                    studentId: '@_id'
                }, {
                    update: {
                        method: 'PUT'
                    }
                });
            }

            function create(dataset){
                var dfd = $q.defer();

                $http.post('/api/datasets', dataset)
                    .success(function (data, status, headers, config) {
                        dfd.resolve(data);
                    })
                    .error(function (data, status, headers, config) {
                        dfd.reject(data);
                    });

                return dfd.promise;
            }

            function update(dataset){
                var dfd = $q.defer();

                $http.put('/api/datasets/' + dataset._id, dataset)
                    .success(function (data, status, headers, config) {
                        dfd.resolve(data);
                    })
                    .error(function (data, status, headers, config) {
                        dfd.reject(data);
                    });

                return dfd.promise;
            }

            function remove(dataset){
                var dfd = $q.defer();

                $http.delete('/api/datasets/' + dataset._id)
                    .success(function (data, status, headers, config) {
                        dfd.resolve(data);
                    })
                    .error(function (data, status, headers, config) {
                        dfd.reject(data);
                    });

                return dfd.promise;
            }

            function purchaseDataset(dataset){
                var dfd = $q.defer();

                $http.post('/api/datasets/purchasedataset/' + dataset._id, dataset)
                    .success(function (data, status, headers, config) {
                        dfd.resolve(data);
                    })
                    .error(function (data, status, headers, config) {
                        dfd.reject(data);
                    });

                return dfd.promise;
            }
            
            function user(username) {
                 return $http({
                    url: 'api/datasets/user/' + username,
                    method: 'GET'
                });   
            }

            function filter(field, value) {
                return $http({
                    url: 'api/datasets/filter/' + field + '/' + value,
                    method: 'GET'
                });
            }

            function search(q, itemsPerPage, currentPage) {
                return $http({
                    url: 'api/datasets/search?q=' + q + '&itemsPerPage=' + itemsPerPage + '&currentPage=' + currentPage,
                    method: 'GET'
                });
            }

            function addToUserApiCall(dataset) {
                var dfd = $q.defer();

                $http.post('api/datasets/copy', dataset)
                    .success(function (data, status, headers, config) {
                        dfd.resolve(data);
                    })
                    .error(function (data, status, headers, config) {
                        dfd.reject(data);
                    });

                return dfd.promise;
            }

            function getDatasetWithS3(datasetId) {
                return $http({
                    url: 'api/datasets/' + datasetId + '/withs3',
                    method: 'GET'
                }).then(function (res) {
                    return res.data;
                }, function (err) {
                    console.error(err);
                });
            }

            function saveCustom(dataset) {
                return $http({
                    url: '/api/datasets/saveCustom',
                    data: dataset,
                    method: 'POST'
                }).then(function (res) {
                    return res.data;
                }, function (err) {
                    console.log(err);
                });
            }

            function mergeColumns(data) {
                return $http({
                    url: '/api/datasets/merge',
                    data: data,
                    method: 'POST'
                }).then(function (res) {
                    return res.data;
                }, function (err) {
                    console.error(err);
                });
            }

            function insert(data) {
                return $http({
                    url: '/api/datasets/insert',
                    data: data,
                    method: 'POST'
                }).then(function (res) {
                    return res.data;
                });
            }
        }
    ]);
