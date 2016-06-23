'use strict';

angular.module('process')
    .controller('ProcessMainController',
        ['$state', '$stateParams', '$timeout', 'Datasets', 'UsersFactory', 'Authentication', 'Process',
            function ($state, $stateParams, $timeout, Datasets, UsersFactory, Authentication, Process) {
                var vm = this;

        vm.user = Authentication.user;
        vm.showLoader = false;
        vm.selectedDataset = '';
        vm.dataset = {
          rows: [],
          columns: []
        };
        vm.process = null;

        Process.getByUser(vm.user._id)
          .then(function(processes) {
            vm.usersProcesses = processes;
          });

        UsersFactory.finduserdatasets(vm.user)
          .then(function(datasets) {
            vm.usersDatasets = datasets;
            Process.setUsersDatasets(datasets);
          });

        vm.onDatasetChange = function(dataset) {
          // re-initialize table data
          vm.dataset.rows = [];
          vm.dataset.columns = [];

          // Persist selected dataset
          Process.setSelectedDataset(dataset);
          vm.selectedDataset = dataset.title;
          vm.showLoader = true;
          Datasets.getDatasetWithS3(dataset._id)
          .then(function (data) {
            vm.showLoader = false;
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
              user: vm.user._id
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
          $state.go('lab.process.popup', {type: 'create'});
        };

        vm.openEditModal = function() {
          $state.go('lab.process.popup', {type: 'edit'});
        };

        vm.onProcessChange = function(process) {
          Process.setSelectedProcess(process);
          vm.process = process;
        };
    }]);
