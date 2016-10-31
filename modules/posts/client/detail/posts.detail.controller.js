'use strict';

//posts Detail Controller
angular.module('posts')
    .controller('postsDetailController', ['$stateParams', 'Authentication', 'posts', '$state', '$log', 'Datasets', '$modal', 'toastr', 'prompt',
            function ($stateParams, Authentication, posts, $state, $log, Datasets, $modal, toastr, prompt) {

            var vm = this;

            vm.tabs = [];

            vm.activeTab = '';

            vm.notfound = false;
            
            vm.authentication = Authentication;
            
            posts.crud.get({
                postId: $stateParams.postId
            }).$promise.then(function (response) {
                vm.post = response;
                if (vm.post.datasets.length){
                    vm.tabs.push('Datasets');
                    vm.activeTab = vm.activeTab === '' ? 'Datasets' : vm.activeTab;
                }
                if (vm.post.models.length){
                    vm.tabs.push('Models');
                    vm.activeTab = vm.activeTab === '' ? 'Models' : vm.activeTab;
                }
                if (vm.post.files.length){
                    vm.tabs.push('Files');
                    vm.activeTab = vm.activeTab === '' ? 'Files' : vm.activeTab;
                }
            }, function (err) {
                $log.error(err);
                vm.notfound = true;
            });

            // This is a silent event
            posts.trackpostview($stateParams.postId)
                .then()
                .catch(function (error) {
                    $log.error(error);
                });

            vm.changeTab = function(tab){
                vm.activeTab = tab;
            };

            vm.addToUser = function (dataset) {
                Datasets.addToUserApiCall(dataset)
                    .then(function (data) {
                        toastr.success('Added dataset to your lab.');
                    })
                    .catch(function (error) {
                        $log.error(error);
                        toastr.error('An error occurred while adding dataset to your lab.');
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

            vm.purchaseDataset = function(dataset){
                prompt({
                    title: 'Confirm Purchase?',
                    message: 'Are you sure you want to purchase this dataset for $' + dataset.cost + '?'
                }).then(function(){
                    Datasets.purchaseDataset(dataset)
                        .then(function(result){
                            dataset.purchased = true;
                            toastr.success('Dataset purchased successfully and it has been copied to your LAB.');
                        })
                        .catch(function(err){
                            $log.error(err);
                            toastr.error('Error purchasing dataset.');
                        });
                });
            };

            vm.remove = function(){
                posts.crud.remove({
                    postId: $stateParams.postId
                }).$promise.then(function (response) {
                        $state.go('users.profilepage.posts', {
                            username: vm.authentication.user.username
                        });
                        toastr.success('Post deleted successfully.');
                    }, function (err) {
                        vm.error = err.message;
                        toastr.error('Error deleting post.');
                    });
            };


 }]);
