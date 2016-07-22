(function () {
  'use strict';

  // Models controller
  angular
    .module('models')
    .controller('ModelsController', ModelsController);

  ModelsController.$inject = ['$scope', '$state', 'Authentication', 'modelResolve'];

  function ModelsController ($scope, $state, Authentication, model) {
    var vm = this;

    vm.authentication = Authentication;
    vm.model = model;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Model
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.model.$remove($state.go('models.list'));
      }
    }

    // Save Model
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.modelForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.model._id) {
        vm.model.$update(successCallback, errorCallback);
      } else {
        vm.model.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('models.view', {
          modelId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
