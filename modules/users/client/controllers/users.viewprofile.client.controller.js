'use strict';

angular.module('users').controller('UsersProfilePageController', 
    ['$scope', '$modal', '$http', '$location', '$stateParams', 'Users', 'UsersFactory', 'Authentication', 'Datasets', 
    function($scope, $modal, $http, $location, $stateParams, Users, UsersFactory, Authentication, Datasets) {
        var vm = this;

        vm.authentication = Authentication;
        vm.user = Authentication.user;
        vm.usersData = [];
        vm.usersDatasets = [];

        vm.isCurrentUser = function () {
      		return ($stateParams.username === vm.user.username);
        };
        
        UsersFactory.finduser($stateParams.username)
            .then(function(user) {
                vm.userData = user;
                return user;
            })
            .then(UsersFactory.finduserdatasets.bind(UsersFactory))
            .then(function(usersDatasets) {
                vm.usersDatasets = usersDatasets;
            });

        vm.addToUser = function (dataset) {
            Datasets.addToUserApiCall(dataset)
                .then(function (data) {
                    console.log(data);
                })
                .catch(function (error) {
                    console.log(error);
                });
        };
    
        vm.showEditModal = function (dataset) {
            var modalInstance = $modal.open({
                templateUrl: 'modules/datasets/client/detail/datasets.detail.modal.html',
                controller: 'DatasetsDetailModalController',
                controllerAs: 'DatasetDetailModal',
                size: 'lg',
                resolve: {
                    viewingDataset: dataset,
                    usersDatasets: function () {
                        return angular.copy(vm.usersDatasets);
                    }
                }
            });
        };
}]);
