(function () {
  'use strict';

  /* global moment */

  angular
    .module('models')
    .controller('ModelsListController', ModelsListController);

  ModelsListController.$inject = ['$state', '$stateParams', 'Models', 'ModelsService', 'UsersFactory', 'prompt', 'toastr', '$log', 'Authentication', 'BillingService', 'Datasets'];

  function ModelsListController($state, $stateParams, Models, ModelsService, UsersFactory, prompt, toastr, $log, Authentication, BillingService, Datasets) {

    var vm = this;

    vm.user = Authentication.user;

    vm.resolved = false;
    vm.loading = false;

    vm.totalItems = 0;
    vm.currentPage = 1;
    vm.itemsPerPage = 50;
    vm.pageChanged = function(){
      loadSearchData();
    };
    
    vm.state = $state.current.name;
    vm.ownership = UsersFactory.ownership();

    vm.load = function () {
      vm.resolved = false;
      vm.loading = true;
    };

    vm.loaded = function () {
      vm.resolved = true;
      vm.loading = false;
    };

    if ($stateParams.search){
      vm.q = $stateParams.search;
      loadSearchData();
    }

    function loadSearchData(){
      ModelsService.search(vm.q, vm.itemsPerPage, vm.currentPage)
          .success(function (response) {
            vm.list = response.models;
            vm.totalItems = response.count;
            vm.loaded();
          })
          .error(function (error) {
            vm.loaded();
          });
    }

    vm.remove = function(model) {
      prompt({
        title: 'Confirm Delete?',
        message: 'Are you sure you want to delete this model?'
      }).then(function(){
        ModelsService.remove(model)
            .then(function(){
              toastr.success('Model deleted successfully!');
              $state.go('users.profilepage.models', { username : vm.user.username });
            })
            .catch(function(err){
              $log.error(err);
              toastr.error('Error deleting model!');
            });
      });
    };

    vm.search = function () {
      if (vm.q && vm.q !== ''){
        $state.go('models.search', { search : vm.q });
      }
      else{
        toastr.error('You need to enter a word or phrases to search by.');
      }
    };

    vm.purchaseModel = function(model){
      BillingService.openCheckoutModal({
        title:'Purchase model',
        description: model.title + ' $'+ model.cost,
        type: 'model',
        id: model._id
      }, function(err, result){
        if (err){
          $log.error(err);
          toastr.error('Error purchasing model.');
        }
        else{
          model.purchased = true;
          toastr.success('Model purchased successfully and it has been copied to your page.');
        }
      });
    };

    vm.copyModel = function(model){
      ModelsService.showTitleModal(model.title + ' - ' + moment().format('MM/DD/YYYY, h:mm:ss a'), function(result) {
          model.title = result.title;
          ModelsService.addToUserApiCall(model)
                .then(function (data) {
                  toastr.success('Model copied to your page.');
                })
                .catch(function (err) {
                  $log.error(err);
                  toastr.error('An error occurred while copying the model.');
                });
          })
          .catch(function (err) {
            $log.error(err);
            toastr.error('An error occurred while copying the dataset for the model.');
          });
    };

    vm.viewModel = function(model){
      if (vm.state !== 'users.profilepage.models'){
        if (model.access == 'for sale' && !model.purchased){
          return;
        }
      }

      $state.go('models.view', { modelId: model._id });
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
