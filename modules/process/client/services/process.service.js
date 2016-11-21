'use strict';

angular.module('process')
    .factory('Process', ['$http', '$q', function($http, $q) {
      var usersDatasets = null;

      return {
        setUsersDatasets: function(datasets) {
          usersDatasets = datasets;
        },
        getUsersDatasets: function() {
          return usersDatasets;
        },
        getByUser: function() {
          var dfd = $q.defer();

          $http.get('api/process/user')
              .success(function (data, status, headers, config) {
                dfd.resolve(data);
              })
              .error(function (data, status, headers, config) {
                dfd.reject(data);
              });

          return dfd.promise;
        },
        create: function(process) {
          var dfd = $q.defer();

          $http.post('api/process', { process: process })
            .success(function (data, status, headers, config) {
              dfd.resolve(data);
            })
            .error(function (data, status, headers, config) {
              dfd.reject({ status : status, message : data });
            });

          return dfd.promise;
        },
        update: function(process) {
          var dfd = $q.defer();

          $http.put('api/process/' + process._id, { process: process })
              .success(function (data, status, headers, config) {
                dfd.resolve(data);
              })
              .error(function (data, status, headers, config) {
                  dfd.reject({ status : status, message : data });
              });

          return dfd.promise;
        },
        remove: function(process) {
          return $http({
            url: 'api/process/' + process._id,
            method: 'DELETE'
          }).then(function(res) {
              return res.data;
          }, function (err) {
              console.log(err);
          });
        }
      };
    }]);
