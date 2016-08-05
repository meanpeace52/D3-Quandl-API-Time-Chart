(function () {
  'use strict';

  angular
    .module('models')
    .controller('ModelsListController', ModelsListController);

  ModelsListController.$inject = ['$state', '$stateParams', 'Models', 'ModelsService', 'UsersFactory'];

  function ModelsListController($state, $stateParams, Models, ModelsService, UsersFactory) {

    var vm = this;

    vm.resolved = false;
    vm.loading = false;
    
    vm.load = function() {
      vm.resolved = false;
      vm.loading = true;
    };

    vm.loaded = function () {
      vm.resolved = true;
      vm.loading = false;
    };
    
    vm.state = $state.current.name;

    vm.ownership = UsersFactory.ownership();

    
   vm.query = function() {
      vm.load();
      ModelsService.query().$promise.then(function (res) {
        vm.loaded();
        vm.list = res;
      });
    };

    if ($state.current.name === 'models.filter') {
      var field = $stateParams.field;
      var value = $stateParams.value;
      vm.load();
      Models.filter(field, value)
        .then(function (models) {
          vm.list = models;
          vm.loaded();
        }, function (error) {
          vm.loaded();
        });
    }

    else if ($state.current.name === 'users.profilepage.models') {
      vm.load();
      UsersFactory.userData('models', $stateParams.username).then(function (models) {
        vm.list = models;
        vm.loaded();
      });
    }

  }
})();
