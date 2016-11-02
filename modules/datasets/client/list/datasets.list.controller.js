'use strict';

//datasets List Controller
angular.module('datasets').controller('DatasetsListController', ['$state', '$stateParams', '$sce', '$modal', 'Authentication',
                                        'Datasets','UsersFactory', 'toastr', '$log',
    function ($state, $stateParams, $sce, $modal, Authentication, Datasets, UsersFactory, toastr, $log) {
        var vm = this;

        vm.authentication = Authentication;
        vm.user = Authentication.user;

        vm.resolved = false;
        vm.loading = false;

        vm.totalItems = 0;
        vm.currentPage = 1;
        vm.itemsPerPage = 50;
        vm.pageChanged = function(){
            loadSearchData();
        };
        
        vm.ownership = UsersFactory.ownership();
        vm.showCreate = $state.current.name == 'datasets.list' || $state.current.name == 'datasets.search';
        vm.myDatasets = $state.current.name == 'users.profilepage.datasets';
        
        vm.load = function () {
            vm.resolved = false;
            vm.loading = true;
        };

        vm.loaded = function () {
            vm.resolved = true;
            vm.loading = false;
        };

        if ($stateParams.search){
            vm.q = $stateParams.search;
            loadSearchData();
        }

        function loadSearchData(){
            Datasets.search(vm.q, vm.itemsPerPage, vm.currentPage)
                .success(function (response) {
                    vm.list = response.datasets;
                    vm.totalItems = response.count;
                    vm.loaded();
                })
                .error(function (error) {
                    vm.loaded();
                });
        }

        vm.deleteDataset = function(dataset){
            if (vm.user._id === dataset.user._id || vm.user._id === dataset.user){
                Datasets.remove(dataset)
                    .then(function(){
                        vm.list = _.without(vm.list, dataset);
                        toastr.success('Dataset deleted successfully.');
                    })
                    .catch(function(err){
                        $log.error(err);
                        toastr.error('Error deleting dataset.');
                    });
            }
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
            if (vm.q && vm.q !== ''){
                $state.go('datasets.search', { search : vm.q });
            }
            else{
                toastr.error('You need to enter a word or phrases to search by.');
            }
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
                    toastr.success('Dataset copied to your page.');
                })
                .catch(function (err) {
                    $log.error(err);
                    toastr.error('An error occurred while copying the dataset.');
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
