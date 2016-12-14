'use strict';
//posts service used for communicating with the posts REST endpoints
angular.module('companies').factory('CompaniesService', ['$resource', '$http', '$state', '$q',
  function ($resource, $http, $state, $q) {

    var companies = {};

    companies.search = function (query) {
      var dfd = $q.defer();

      $http.get('/api/companies/search/' + query)
          .success(function (data, status, headers, config) {
            dfd.resolve(data);
          })
          .error(function (data, status, headers, config) {
            dfd.reject({ status : status, message : data });
          });

      return dfd.promise;
    };

    companies.searchStatements = function (query) {
      var dfd = $q.defer();

      $http.get('/api/companies/search-statements/' + query)
          .success(function (data, status, headers, config) {
              dfd.resolve(data);
          })
          .error(function (data, status, headers, config) {
              dfd.reject({ status : status, message : data });
          });

      return dfd.promise;
    };

    return companies;
  }
]);
