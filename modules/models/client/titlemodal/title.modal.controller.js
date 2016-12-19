'use strict';

//datasets List Controller
angular.module('models').controller('TitleModalController', ['$uibModalInstance', '$state', '$stateParams', 'Models',
                'toastr', '$log', '$scope', 'modelTitle',
    function ($uibModalInstance, $state, $stateParams, Datasets, toastr, $log, $scope, modelTitle) {
        var vm = this;

        vm.title = modelTitle;

        vm.ok = function(title){
            $uibModalInstance.close({ title : title });
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss();
        };
}]);
