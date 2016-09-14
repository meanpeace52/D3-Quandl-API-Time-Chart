'use strict';

angular.module('users').controller('UsersProfilePageController', ['$state', '$scope', '$modal', '$http', '$location', '$stateParams', '$log', 'Users', 'UsersFactory', 'Authentication', 'Datasets',
    function ($state, $scope, $modal, $http, $location, $stateParams, $log, Users, UsersFactory, Authentication, Datasets) {
        
        var vm = this;

        vm.user = Authentication.user;
        
        vm.username = $stateParams.username;
        
        vm.params = $stateParams;
        
        vm.ownership = UsersFactory.ownership();

        vm.isCurrentUser = vm.user.username === vm.username;

        vm.loading = true;

        vm.founduser = false;

        vm.menuItems = [{
            title: 'Posts',
            state: 'users.profilepage.posts({user: UsersProfilePage.params.username})'
                }, {
            title: 'Models',
            state: 'users.profilepage.models({user: UsersProfilePage.params.username})'
                }, {
            title: 'Datasets',
            state: 'users.profilepage.datasets({user: UsersProfilePage.params.username})'
                }];

        if (!vm.isCurrentUser){
            UsersFactory.finduser($stateParams.username)
                .then(function(user){
                    if (user){
                        vm.externaluser = user;
                        vm.founduser = true;
                        vm.loading = false;
                    }
                    else{
                        vm.loading = false;
                    }
                }, function(){
                    vm.loading = false;
                });
        }
        else{
            vm.founduser = true;
            vm.loading = false;
        }
            
            
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
