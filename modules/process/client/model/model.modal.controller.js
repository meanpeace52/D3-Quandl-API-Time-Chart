'use strict';

angular.module('process')
    .controller('ModelModalController',
        ['$uibModalInstance', '$state', '$stateParams', '$q', 'Authentication', 'Datasets', 'Models', 'tasks', 'results',
          function ($uibModalInstance, $state, $stateParams, $q, Authentication, Datasets, Models, tasks, results) {
            var vm = this;

            vm.model = null;
            vm.dataset = null;
            vm.tasks = tasks;
            vm.saving = false;
            vm.tabs = ['Transformation Steps'];

            if (results.dataset){
                vm.dataset = results.dataset;
                vm.tabs.unshift('Dataset');
            }

            if (tasks[tasks.length - 1].returnType === 'model'){
                vm.model = {
                    type: tasks[tasks.length - 1].title,
                    equation: _.find(results.objects, { name : 'equation' }).value,
                    metrics: _.find(results.objects, { name : 'metrics' }).value,
                    output: results.console
                };
                vm.tabs.unshift('Model');
            }

            vm.activeTab = vm.tabs[0];

            vm.changeTab = function(tab){
                vm.activeTab = tab;
            };

        vm.save = function() {
          vm.saving = true;
          /*
          getDataset()
            .then(function(dataset) {
              if (vm.model) {
                return Models.create({
                  title: vm.model.title,
                  type: vm.model.type,
                  dataset: dataset._id,
                  y: _.last(tasks).options.yColIndex,
                  model: lastResult,
                  user: Authentication.user._id,
                  access: vm.model.access
                });
              }
              return null;
            })
            .then(function(model) {
              $uibModalInstance.close(model);
            })
            .catch(function(err) {
              //TODO: rollback if model fails and dataset has been saved
              console.error('error saving model', err);
              var message = '';
              if (err instanceof Error) {
                message = err.message;
              } else if (err.data && err.data.message) {
                message = err.data.message;
              }
              alert('Failed with error: ' + (message || err));
            })
            .finally(function() {
              vm.saving = false;
            });
            */
        };

        vm.discard = function() {
          $uibModalInstance.dismiss();
        };

    }]);
