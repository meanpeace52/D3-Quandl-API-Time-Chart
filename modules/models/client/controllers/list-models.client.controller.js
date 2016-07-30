(function () {
  'use strict';

  angular
    .module('models')
    .controller('ModelsListController', ModelsListController);

  ModelsListController.$inject = ['$state', '$stateParams','Models','ModelsService', 'UsersFactory'];

  function ModelsListController($state, $stateParams, Models, ModelsService, UsersFactory) {

    var vm = this;

    vm.models = ModelsService.query();
    
    vm.ownership = UsersFactory.ownership();
    
    if ($state.current === 'models.filter') {
      var field = $stateParams.field;
      var value = $stateParams.value;
      vm.loadingResults = true;
      Models.filter(field, value)
        .then(function (models) {
          vm.models = models;
          vm.loadingResults = false;
        }, function (error) {
          vm.loadingResults = false;
        });
    }
    
  }
})();
