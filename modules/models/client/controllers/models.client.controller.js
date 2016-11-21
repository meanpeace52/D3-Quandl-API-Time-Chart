(function () {
  'use strict';

  // Models controller
  angular
    .module('models')
    .controller('ModelsController', ModelsController);

  ModelsController.$inject = ['$scope', '$state', 'Authentication', 'modelResolve', 'modelOptions', 'ModelsService', 'toastr', '$log', 'prompt', 'Datasets'];

  function ModelsController ($scope, $state, Authentication, model, modelOptions, ModelsService, toastr, $log, prompt, Datasets) {
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

    function saveModel(){
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

    function updateDataset(dataset){
      Datasets.update(dataset);
    }

    // Save Model
    function save(isValid) {
      vm.submitted = true;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.modelForm');
        toastr.error('Please fix all validation errors, before you can save.');
        return false;
      }


      if (vm.model.dataset.access !== vm.model.access && vm.model.dataset.cost !== vm.model.cost) {
          prompt({
            title: 'Is that ok?',
            message: 'The price and access for the dataset used for this model needs to be the same, so we\'ll change it to match?'
          }).then(function(){
            vm.model.dataset.access = vm.model.access;
            vm.model.dataset.cost = vm.model.cost;
            updateDataset(vm.model.dataset);
            saveModel();
          });
      }
      else if (vm.model.dataset.access !== vm.model.access){
        prompt({
          title: 'Is that ok?',
          message: 'The access for the dataset used for this model must also be changed to ' + vm.model.access + '?'
        }).then(function(){
          vm.model.dataset.access = vm.model.access;
          updateDataset(vm.model.dataset);
          saveModel();
        });
      }
      else if (vm.model.dataset.cost !== vm.model.cost){
        prompt({
          title: 'Is that ok?',
          message: 'The price for the dataset used for this model cannot be higher than the model, so we\'ll change it to match?'
        }).then(function(){
          vm.model.dataset.cost = vm.model.cost;
          updateDataset(vm.model.dataset);
          saveModel();
        });
      }
      else{
        saveModel();
      }
    }
  }
})();
