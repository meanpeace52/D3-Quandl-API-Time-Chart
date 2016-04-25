'use strict';

angular.module('datasets')
    .factory('Datasets', ['$resource', '$http',
        function ($resource, $http) {

            return {
                crud: crud(),
                search: search,
                addToUserApiCall: addToUserApiCall,
                getDatasetWithS3: getDatasetWithS3,
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


            function search(q) {
                return $http({
                    url: 'api/datasets/search?q=' + q,
                    method: 'GET'
                });
            }

            function addToUserApiCall(dataset) {
                return $http({
                    url: 'api/datasets',
                    data: dataset,
                    method: 'POST'
                }).then(function (res) {
                    console.log('done saving to user', res);
                    return res.data;
                }).catch(function (err) {
                    console.log('error saving to user', err);
                });
            }

            function getDatasetWithS3(datasetId) {
            	return $http({
            		url: 'api/datasets/' + datasetId + '/withs3',
            		method: 'GET'
            	}).then(function(res) {
                    return res.data;
				}, function (err) {
                    console.log(err);
                });
            }
        }
    ]);


