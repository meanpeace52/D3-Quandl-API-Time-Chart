'use strict';

angular.module('process')
    .controller('LROptionsController', ['$stateParams', 'Datasets', 'selectedDataset', function($stateParams, Datasets, selectedDataset) {

      var vm = this;

      vm.options = $stateParams.options || {};

      if (selectedDataset) {
        Datasets.getDatasetWithS3(selectedDataset._id)
        .then(function (data) {
          vm.columns = data.columns;
        });
      }

    }]);
