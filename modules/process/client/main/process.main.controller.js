'use strict';

//Datasets Detail Controller
angular.module('process')
    .controller('ProcessMainController',
        ['$stateParams', 'Datasets', 'UsersFactory', 'Authentication', 'DTOptionsBuilder', 'DTColumnDefBuilder',
            function ($stateParams, Datasets, UsersFactory, Authentication, DTOptionsBuilder, DTColumnDefBuilder) {
                var vm = this;

    		vm.authentication = Authentication;
    		vm.user = Authentication.user;
        vm.showLoader = false;
        vm.selectedDataset = '';
        vm.dataset = {
          rows: [],
          columns: [],
          dtOptions: DTOptionsBuilder.newOptions()
            .withOption('paging', false)
            .withOption('sort', false)
            .withOption('searching', false)
            .withOption('scrollY', 500)
            .withOption('info', false)
            .withOption('deferRender', true)
            .withOption('fnInitComplete', function () {
              vm.showLoader = false;
            })
        };

        UsersFactory.finduserdatasets(vm.user).then(function (usersDatasets) {
          vm.usersDatasets = usersDatasets;
        });

        vm.onDatasetChange = function(dataset) {
          vm.selectedDataset = dataset.title;
          vm.showLoader = true;
          Datasets.getDatasetWithS3(dataset._id)
          .then(function (data) {
            vm.dataset.dtColumnDefs = data.columns.map(function (column, i) {
              return DTColumnDefBuilder.newColumnDef(i).notSortable();
            });
            vm.dataset.columns = data.columns;
    				vm.dataset.rows = data.rows;
          });
        };

    }]);
