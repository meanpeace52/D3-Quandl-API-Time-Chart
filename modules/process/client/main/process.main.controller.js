'use strict';

angular.module('process')
    .controller('ProcessMainController',
        ['$state', '$stateParams', 'Datasets', 'UsersFactory', 'Authentication', 'Process', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'user', 'datasets',
            function ($state, $stateParams, Datasets, UsersFactory, Authentication, Process, DTOptionsBuilder, DTColumnDefBuilder, user, datasets) {
                var vm = this;


        vm.usersDatasets = datasets;
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
        vm.process = null;

        vm.onDatasetChange = function(dataset) {
          // Persist selected dataset
          Process.setSelectedDataset(dataset);
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

        // The Lab page has received data from the process modal.
        // the update in state unfortunately requires a reload which 
        // resets the state of the controller. Until a better solution
        // is implemented, going with restoring the previous state for now.
        if ($stateParams.data) {
          if ($stateParams.data.type === 'create') {
            Process.setSelectedProcess({
              title: 'Unnamed',
              tasks: $stateParams.data.tasks,
              user: user._id
            });
          } else {
            Process.setSelectedProcess(_.extend(Process.getSelectedProcess(), {
              tasks: $stateParams.data.tasks
            }));
          }

          vm.process = Process.getSelectedProcess();

          var selectedDataset = Process.getSelectedDataset();
          if (selectedDataset) {
            vm.selectedDataset = selectedDataset.title;
            vm.onDatasetChange(selectedDataset);
          }
        }

        vm.openCreateModal = function() {
          if (!vm.selectedDataset) {
            return alert('Please select a datatset!');
          }
          $state.go('lab.process.popup', {type: 'create'}, {reload: true});
        };

        vm.openEditModal = function() {
          $state.go('lab.process.popup', {type: 'edit'}, {reload: true});
        };
    }]);
