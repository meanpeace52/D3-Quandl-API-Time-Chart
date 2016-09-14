'use strict';

//datasets List Controller
angular.module('datasets').controller('DatasetsListController', ['$state', '$stateParams', '$sce', '$modal', 'Authentication', 'Datasets','UsersFactory',
    function ($state, $stateParams, $sce, $modal, Authentication, Datasets, UsersFactory) {
        var vm = this;

        vm.authentication = Authentication;
        vm.user = Authentication.user;

        vm.resolved = false;
        vm.loading = false;
        
        vm.ownership = UsersFactory.ownership();
        vm.showCreate = $state.current.name == 'datasets.list';
        
        vm.load = function () {
            vm.resolved = false;
            vm.loading = true;
        };

        vm.loaded = function () {
            vm.resolved = true;
            vm.loading = false;
        };

        vm.filterData = function (field, value) {
            vm.load();
            Datasets.filter(field, value).then(function (res) {
                vm.list = res.data;
                vm.loaded();
            }, function (err) {
                vm.loaded();
            });
        };

        vm.state = $state.current.name;
        
        if (vm.state === 'datasets.filter') {
            vm.filterData($stateParams.field, $stateParams.value);
        }

        else if (vm.state === 'users.profilepage.datasets') {
            vm.load();
            Datasets.user($stateParams.username).then(function (res) {
                vm.list = res.data;
                vm.loaded();
            }, function (err) {
                vm.loaded();
            });
        }

        vm.search = function () {
            vm.load();
            Datasets.search(vm.q)
                .success(function (response) {
                    vm.list = response;
                    vm.loaded();
                })
                .error(function (error) {
                    vm.loaded();
                });
        };

        vm.showTitle = function (title) {
            var q = vm.q,
                matcher = new RegExp(q, 'gi');
            var highlightedTitle = title.replace(matcher, '<span class="matched">$&</span>');
            // console.log(highlightedTitle);
            return $sce.trustAsHtml(highlightedTitle);
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

        vm.showData = function (dataset) {
            var modalInstance = $modal.open({
                templateUrl: 'modules/datasets/client/detail/datasets.detail.modal.html',
                controller: 'DatasetsDetailModalController',
                controllerAs: 'DatasetDetailModal',
                size: 'md',
                resolve: {
                    viewingDataset: dataset
                }
            });
        };
}]);
