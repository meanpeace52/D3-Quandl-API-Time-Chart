'use strict';

//Posts Create Controller
angular.module('datasets')
    .controller('DatasetsCreateController',
        ['$scope', '$state', 'Authentication', 'Datasets',
            function ($scope, $state, Authentication, Datasets) {
                var vm = this;

                vm.authentification = Authentication;

                // Create new Post
                vm.create = function (isValid) {
                    vm.error = null;

                    if (!isValid) {
                        $scope.$broadcast('show-errors-check-validity', 'postForm');

                        return false;
                    }

                    // Redirect after save
                    vm.dataset.$save(function (response) {
                        $state.go('datasets.detail', { datasetId: response._id });

                    }, function (errorResponse) {
                        vm.error = errorResponse.data.message;
                    });
                };
            }]);
