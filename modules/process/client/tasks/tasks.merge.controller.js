'use strict';

angular.module('process')
    .controller('MergeTaskOptionsController', ['$stateParams', 'Datasets', 'user', 'datasets', 'selectedDataset', function($stateParams, Datasets, user, datasets, selectedDataset) {

      var vm = this;
      vm.options = $stateParams.options || {};
      vm.options.dataset1 = selectedDataset;

      vm.usersDatasets = datasets;
      vm.dataset1 = selectedDataset;

      Datasets.getDatasetWithS3(vm.dataset1._id)
      .then(function (data) {
        vm.dataset1Keys = data.columns;
      });

      vm.onDatasetChange = function() {
        vm.dataset2Keys = '';
        Datasets.getDatasetWithS3(vm.options.dataset2._id)
        .then(function (data) {
          vm.dataset2Keys = data.columns;
        });
      };

    }]);
