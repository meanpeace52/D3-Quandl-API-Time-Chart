'use strict';

angular.module('process')
    .controller('ProcessMainController',
        ['$stateParams', 'Datasets', 'UsersFactory', 'Authentication', 'DTOptionsBuilder', 'DTColumnDefBuilder',
            function ($stateParams, Datasets, UsersFactory, Authentication, DTOptionsBuilder, DTColumnDefBuilder) {
                var vm = this;

        // The Lab page has received data from the process modal.
        // TODO: Determine whether to create a new one or edit an existing
        // one and perform further actions.
        if ($stateParams.data) {
          console.log('Inside Main Controller: do something with the modal data', $stateParams.data);
        }

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
