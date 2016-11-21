(function () {
  'use strict';

  // Models controller
  angular
    .module('models')
    .controller('ModelsController', ModelsController);

  ModelsController.$inject = ['$scope', '$state', 'Authentication', 'modelResolve', 'modelOptions', 'ModelsService', 'toastr', '$log', 'prompt'];

  function ModelsController ($scope, $state, Authentication, model, modelOptions, ModelsService, toastr, $log, prompt) {
    var vm = this;

    vm.authentication = Authentication;
    vm.user = vm.authentication.user;
    vm.model = model;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.accessList = modelOptions.access;
    vm.submitted = false;

    // Remove existing Model
    function remove() {
      prompt({
        title: 'Confirm Delete?',
        message: 'Are you sure you want to delete this model?'
      }).then(function(){
        ModelsService.remove(vm.model)
            .then(function(){
              toastr.success('Model deleted successfully!');
              $state.go('users.profilepage.models', { username : vm.user.username });
            })
            .catch(function(err){
              $log.error(err);
              toastr.error('Error deleting model!');
            });
      });
    }

    // Save Model
    function save(isValid) {
      vm.submitted = true;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.modelForm');
        toastr.error('Please fix all validation errors, before you can save.');
        return false;
      }

      if (vm.model._id) {
        ModelsService.update(vm.model)
            .then(function(result){
              toastr.success('Model updated successfully!');
              $state.go('models.view', {
                modelId: vm.model._id
              });
            })
            .catch(function(err){
              $log.error(err);
              toastr.error(err.message);
            });
      } else {
        ModelsService.create(vm.model)
            .then(function(res){
              toastr.success('Model created successfully!');
              $state.go('models.view', {
                modelId: res._id
              });
            })
            .catch(function(err){
              $log.error(err);
              toastr.error(err.message);
            });
      }
    }
  }
})();
