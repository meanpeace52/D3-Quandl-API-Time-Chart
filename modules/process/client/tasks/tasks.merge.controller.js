'use strict';

angular.module('process')
    .controller('MergeTaskOptionsController', ['$stateParams', 'Datasets', 'usersDatasets', 'selectedDataset', function($stateParams, Datasets, usersDatasets, selectedDataset) {

      var vm = this;

      vm.options = $stateParams.options || {};
      vm.options.dataset1 = selectedDataset;

      vm.usersDatasets = usersDatasets;
      vm.dataset1 = selectedDataset;

      if (selectedDataset) {
        Datasets.getDatasetWithS3(vm.dataset1._id)
        .then(function (data) {
          vm.dataset1Keys = data.columns;
        });
      }

      vm.onDatasetChange = function() {
        Datasets.getDatasetWithS3(vm.options.dataset2._id)
        .then(function (data) {
          vm.dataset2Keys = data.columns;
        });
      };

      if (vm.options.dataset2) {
        vm.onDatasetChange();
      }

    }]);
