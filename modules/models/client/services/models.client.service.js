//Models service used to communicate Models REST endpoints
(function () {
  'use strict';

  angular
    .module('models')
    .factory('ModelsService', ModelsService);

  ModelsService.$inject = ['$resource'];

  function ModelsService($resource) {
    return $resource('api/models/:modelId', {
      modelId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
