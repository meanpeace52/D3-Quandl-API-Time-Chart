'use strict';

//datasets List Controller
angular.module('datasets').controller('DatasetsListController',
    ['$state', '$sce', '$modal', 'Authentication', 'Datasets',
    function ($state, $sce, $modal, Authentication, Datasets) {
        var vm = this;

        vm.authentication = Authentication;
        vm.loadingResults = false;

        vm.search = function () {
            vm.loadingResults = true;
            Datasets.search(vm.q)
                .success(function (response) {
                    vm.searchResults = response;
                    vm.loadingResults = false;
                })
                .error(function (error) {
                    console.log(error);
                    vm.loadingResults = false;
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

