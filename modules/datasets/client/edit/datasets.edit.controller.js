'use strict';

//Datasets Detail Controller
angular.module('datasets')
    .controller('DatasetsEditController',
        ['$stateParams', 'Datasets', 'UsersFactory', 'Authentication', 'datasetOptions', 'toastr', '$log', '$state', '$scope',
            function ($stateParams, Datasets, UsersFactory, Authentication, datasetOptions, toastr, $log, $state, $scope) {
                var vm = this;

				vm.authentication = Authentication;
				vm.user = Authentication.user;
                vm.datasetOptions = datasetOptions;

                Datasets.crud.get({datasetId: $stateParams.datasetId})
                	.$promise.then(function (dataset) {
	                	vm.dataset = dataset;
                        if (vm.user._id !== vm.dataset.user._id){
                            toastr.error('You do not have access to edit this dataset.');
                            $state.go('users.profilepage.datasets', { username : vm.user.username });
                        }
            		});

                vm.update = function (isValid) {
                    vm.error = null;
                    vm.submitted = true;

                    if (!isValid) {
                        $scope.$broadcast('show-errors-check-validity', 'datasetsForm');
                        return false;
                    }

                    // Redirect after save
                    Datasets.update(vm.dataset)
                        .then(function(dataset){
                            toastr.success('Dataset update successfully!');
                            $state.go('users.profilepage.datasets', { username : vm.authentication.user.username });
                        })
                        .catch(function(err){
                            $log.error(err);
                            toastr.error('Error creating dataset.');
                        });
                };
    }]);
