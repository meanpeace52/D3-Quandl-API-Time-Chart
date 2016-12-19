'use strict';

//datasets List Controller
angular.module('models').controller('ModelTitleModalController', ['$uibModalInstance', 'modelTitle', 'model',
                                    'ModelService', 'toastr',
    function ($uibModalInstance, modelTitle, model, ModelService, toastr) {
        var vm = this;

        vm.title = modelTitle;

        vm.ok = function(title){
            model.title = title;
            ModelService.validateTitle(model)
                .then(function(){
                    $uibModalInstance.close({ title : title });
                })
                .catch(function(){
                    toastr.error('A model with this title already exists.');
                });
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss();
        };
}]);
