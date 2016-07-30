'use strict';

angular.module('users').controller('UsersProfilePageController', ['$state', '$scope', '$modal', '$http', '$location', '$stateParams', 'Users', 'UsersFactory', 'Authentication', 'Datasets',
    function ($state, $scope, $modal, $http, $location, $stateParams, Users, UsersFactory, Authentication, Datasets) {
        var vm = this;

        vm.user = Authentication.user;
        
        vm.ownership = UsersFactory.ownership();

        vm.userData = [];

        vm.menuItems = [{
            title: 'Posts',
            state: 'users.profilepage.posts({field: "user", value: UsersProfilePage.user._id})'
                }, {
            title: 'Models',
            state: 'users.profilepage.models({field: "user", value: UsersProfilePage.user._id})'
                }, {
            title: 'Data',
            state: 'users.profilepage.data({field: "user", value: UsersProfilePage.user._id})'
                }];
            
        vm.userData = function () {
            var data = $stateParams.data||'posts';
            UsersFactory.userData(data, $stateParams.username).then(function (res) {
                vm.userData = res;
            });
        };
        
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
