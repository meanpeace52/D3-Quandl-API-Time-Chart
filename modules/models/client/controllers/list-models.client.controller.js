(function () {
  'use strict';

  angular
    .module('models')
    .controller('ModelsListController', ModelsListController);

  ModelsListController.$inject = ['ModelsService', '$state', '$stateParams'];

  function ModelsListController(ModelsService, $state, $stateParams) {

    var vm = this;

    vm.models = ModelsService.query();

    if ($state.current === 'models.filter') {
      var params = $stateParams;
      var field = params.field;
      var value = params.value;
      ModelsService.find({
          field: value
        })
        .success(function (response) {
          vm.models = response.data;
          vm.loadingResults = false;
        })
        .error(function (error) {
          vm.loadingResults = false;
        });
    }
  }
})();
