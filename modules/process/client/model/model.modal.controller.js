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

        var lastResult = _.last(results);
        //if (Array.isArray(lastResult)) {
          vm.model = {
            type: 'Linear Regression',
            equation: 'Some equation',
            output: lastResult
          };
          //vm.dataset = _.last(_.dropRight(results));
        //} else {
        //  vm.dataset = lastResult;
        //}

        function getDataset() {
          var deferred = $q.defer();
          if (!vm.dataset) {
            //deferred.resolve(selectedDataset._id);
          } else {
            Datasets.insert({
              //selectedDataset: selectedDataset,
              title: vm.dataset.title,
              rows: vm.dataset.rows,
              columns: vm.dataset.columns
            })
            .then(function(dataset) {
              deferred.resolve(dataset);
            }, function(err) {
              deferred.reject(err);
            });
          }
          return deferred.promise;
        }

        vm.save = function() {
          vm.saving = true;
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
        };

        vm.discard = function() {
          $uibModalInstance.dismiss();
        };

    }]);
