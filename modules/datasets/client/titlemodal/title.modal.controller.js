'use strict';

//datasets List Controller
angular.module('datasets').controller('TitleModalController', ['$uibModalInstance', '$state', '$stateParams', 'Datasets',
                'toastr', '$log', '$scope', 'datasetTitle',
    function ($uibModalInstance, $state, $stateParams, Datasets, toastr, $log, $scope, datasetTitle) {
        var vm = this;

        vm.title = datasetTitle;

        vm.ok = function(title){
            $uibModalInstance.close({ title : title });
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss();
        };
}]);
