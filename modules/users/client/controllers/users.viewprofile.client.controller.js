'use strict';

angular.module('users').controller('UsersProfilePageController', ['$state', '$scope', '$modal', '$http', '$location', '$stateParams', 'Users', 'UsersFactory', 'Authentication', 'Datasets',
    function ($state, $scope, $modal, $http, $location, $stateParams, Users, UsersFactory, Authentication, Datasets) {
        var vm = this;


        vm.user = Authentication.user;

        vm.userData = [];

        vm.menuItems = [{
            title: 'Posts',
            state: 'users.profilepage({data: "posts", username: UsersProfilePage.user.username})'
                }, {
            title: 'Models',
            state: 'users.profilepage({data: "models", username: UsersProfilePage.user.username})'
                }, {
            title: 'Datasets',
            state: 'users.profilepage({data: "data", username: UsersProfilePage.user.username})'
            }];
            
        vm.userData = function () {
            var data = $stateParams.data||'posts';
            UsersFactory.userData(data, $stateParams.username).then(function (res) {
                vm.userData = res;
            });
        };

        vm.isCurrentUser = function () {
            return ($stateParams.username === vm.user.username);
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
