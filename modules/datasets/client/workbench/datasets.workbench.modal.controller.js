'use strict';

//Datasets Detail Controller
angular.module('datasets')
    .controller('DatasetsWorkbenchModalController',
        ['$modalInstance', 'mergeData',
            function ($modalInstance, mergeData) {
                var vm = this;
                vm.mergeData = mergeData;
                vm.msgType = mergeData.type;
                vm.isAlert = (function () {
                    if (vm.msgType === 'alert') {
                        return true;
                    } else if (vm.msgType === 'info') {
                        return false;
                    }
                })();

                vm.ok = function () {
                    $modalInstance.close(true);
                };

                vm.cancel = function () {
                    $modalInstance.dismiss(false);
                };

                
            }]);
