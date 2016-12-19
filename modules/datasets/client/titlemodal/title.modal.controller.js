'use strict';

//datasets List Controller
angular.module('datasets').controller('DatasetTitleModalController', ['$uibModalInstance', 'datasetTitle', 'dataset', 'Datasets', 'toastr',
    function ($uibModalInstance, datasetTitle, dataset, Datasets, toastr) {
        var vm = this;

        vm.title = datasetTitle;

        vm.ok = function(title){
            dataset.title = title;
            Datasets.validateTitle(dataset)
                .then(function(){
                    $uibModalInstance.close({ title : title });
                })
                .catch(function(){
                    toastr.error('A dataset with this title already exists.');
                });

        };

        vm.cancel = function () {
            $uibModalInstance.dismiss();
        };
}]);
