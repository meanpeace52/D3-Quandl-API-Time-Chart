//Models service used to communicate Models REST endpoints
(function () {
  'use strict';

  angular
    .module('models')
    .factory('ModelsService', ModelsService);

  ModelsService.$inject = ['$resource', '$http', '$q'];

  function ModelsService($resource, $http, $q) {
    var models = {};

    models.crud = function(){
        return $resource('api/models/:modelId', {
            modelId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    };

    models.create = function (model) {
      var dfd = $q.defer();

      $http.post('/api/models', model)
          .success(function (data, status, headers, config) {
                dfd.resolve(data);
          })
          .error(function (data, status, headers, config) {
            dfd.reject({ status : status, message : data });
          });

      return dfd.promise;
    };

    models.update = function (model) {
      var dfd = $q.defer();

      $http.put('/api/models/' + model._id, model)
          .success(function (data, status, headers, config) {
            dfd.resolve(data);
          })
          .error(function (data, status, headers, config) {
            dfd.reject({ status : status, message : data });
          });

      return dfd.promise;
    };

    models.remove = function (model) {
      var dfd = $q.defer();

      $http.delete('/api/models/' + model._id)
          .success(function (data, status, headers, config) {
            dfd.resolve(data);
          })
          .error(function (data, status, headers, config) {
            dfd.reject({ status : status, message : data });
          });

      return dfd.promise;
    };

    models.search = function (q, itemsPerPage, currentPage) {
      return $http.get('api/models/search?q=' + q + '&itemsPerPage=' + itemsPerPage + '&currentPage=' + currentPage);
    };

    models.user = function(username) {
          var dfd = $q.defer();

          $http.get('api/models/user/' + username)
              .success(function (data, status, headers, config) {
                  dfd.resolve(data);
              })
              .error(function (data, status, headers, config) {
                  dfd.reject({ status : status, message : data });
              });

          return dfd.promise;
    };

    models.findmodelbydataset = function(id){
      var dfd = $q.defer();

      $http.get('/api/models/dataset/' + id)
          .success(function (data, status, headers, config) {
              dfd.resolve(data);
          })
          .error(function (data, status, headers, config) {
              dfd.reject(data);
          });

      return dfd.promise;
    };

    models.purchasemodel = function(id){
        var dfd = $q.defer();

        $http.post('/api/models/purchasemodel/' + id)
            .success(function (data, status, headers, config) {
                dfd.resolve(data);
            })
            .error(function (data, status, headers, config) {
                dfd.reject({ status : status, message : data });
            });

        return dfd.promise;
    };

    models.addToUserApiCall = function(model) {
          var dfd = $q.defer();

          $http.post('api/models/copy', model)
              .success(function (data, status, headers, config) {
                  dfd.resolve(data);
              })
              .error(function (data, status, headers, config) {
                  dfd.reject(data);
              });

          return dfd.promise;
    };

    return models;
  }
})();
