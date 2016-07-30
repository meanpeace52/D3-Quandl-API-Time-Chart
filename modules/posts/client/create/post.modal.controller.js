'use strict';

angular.module('posts').controller('postsModalController', ['$scope', 'Authentication', '$modalInstance', 'Models', 'Datasets', 'modalData', 'Authentication',
    function ($scope, Authentication, $modalInstance, Models, Datasets, modalData) {

        var vm = this;

        vm.modal = true; // disables/enables modal features to reuse list view for models/datasets

        // data passed from resolve
        vm.modalData = modalData;

        if (vm.modelData.type === 'models') {

            Models.filter('user', Authentication.user._id)
                .then(function (models) {
                        vm.loadingResults = false;
                        vm.models = models;
                    },
                    function (error) {
                        vm.loadingResults = false;
                    });
        }
        
        else if (vm.modelData.type === 'datasets') {

            Datasets.user(Authentication.user.username)
                .then(function (datasets) {
                        vm.list = datasets;
                        vm.loadingResults = false;
                    },
                    function (error) {
                        vm.loadingResults = false;
                    });
        }

        vm.ok = function (data) {
            //passes info back to parent controller
            $modalInstance.close(data);
        };

        vm.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
]);
