'use strict';
//posts service used for communicating with the posts REST endpoints
angular.module('companies').factory('CompaniesService', ['$resource', '$http', '$state', '$q',
  function ($resource, $http, $state, $q) {

    var companies = {};

    companies.findbycode = function (code) {
      var dfd = $q.defer();

      $http.get('/api/companies/findbycode/' + code)
          .success(function (data, status, headers, config) {
              dfd.resolve(data);
          })
          .error(function (data, status, headers, config) {
              dfd.reject({ status : status, message : data });
          });

      return dfd.promise;
    };

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

    companies.searchStatementsByTicker = function (ticker) {
      var dfd = $q.defer();

      $http.get('/api/companies/search-statements-by-ticker/' + ticker)
          .success(function (data, status, headers, config) {
              dfd.resolve(data);
          })
          .error(function (data, status, headers, config) {
              dfd.reject({ status : status, message : data });
          });

      return dfd.promise;
    };

    companies.getstatement = function (statement) {
      var dfd = $q.defer();

      $http.post('/api/companies/statement', { s3link : statement.s3link })
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
