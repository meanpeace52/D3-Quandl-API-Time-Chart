(function () {
  'use strict';

  angular
    .module('models')
    .controller('ModelsListController', ModelsListController);

  ModelsListController.$inject = ['ModelsService'];

  function ModelsListController(ModelsService) {
    var vm = this;

    vm.models = ModelsService.query();
  }
})();
