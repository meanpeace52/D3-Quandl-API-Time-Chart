(function () {
  'use strict';

  angular
    .module('models')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('models', {
        abstract: true,
        url: '/models',
        template: '<ui-view/>'
      })
      .state('models.list', {
        url: '',
        templateUrl: 'modules/models/client/views/list-models.client.view.html',
        controller: 'ModelsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Models List'
        }
      })
      .state('models.filter', {
        url: '/:field/:value',
        templateUrl: 'modules/models/client/views/list-models.client.view.html',
        controller: 'ModelsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Models List'
        }
      })
      .state('models.create', {
        url: '/create',
        templateUrl: 'modules/models/client/views/form-model.client.view.html',
        controller: 'ModelsController',
        controllerAs: 'vm',
        resolve: {
          modelResolve: newModel
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Models Create'
        }
      })
      .state('models.edit', {
        url: '/:modelId/edit',
        templateUrl: 'modules/models/client/views/form-model.client.view.html',
        controller: 'ModelsController',
        controllerAs: 'vm',
        resolve: {
          modelResolve: getModel
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Model {{ modelResolve.name }}'
        }
      })
      .state('models.view', {
        url: '/:modelId',
        templateUrl: 'modules/models/client/views/view-model.client.view.html',
        controller: 'ModelsController',
        controllerAs: 'vm',
        resolve: {
          modelResolve: getModel
        },
        data: {
          pageTitle: 'Model {{ postResolve.name }}'
        }
      });
  }

  getModel.$inject = ['$stateParams', 'ModelsService'];

  function getModel($stateParams, ModelsService) {
    return ModelsService.get({
      modelId: $stateParams.modelId
    }).$promise;
  }

  newModel.$inject = ['ModelsService'];

  function newModel(ModelsService) {
    return new ModelsService();
  }
})();
