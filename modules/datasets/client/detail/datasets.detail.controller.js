'use strict';

//Datasets Detail Controller
angular.module('datasets')
    .controller('DatasetsDetailController',
        ['$stateParams', 'Authentication', 'Datasets',
            function ($stateParams, Authentication, Datasets) {
                var vm = this;

                vm.authentication = Authentication;

                vm.dataset = Datasets.get({
                    datasetId: $stateParams.datasetId
                });

                console.log(vm.authentication);
                console.log(vm.dataset);

            }]);
