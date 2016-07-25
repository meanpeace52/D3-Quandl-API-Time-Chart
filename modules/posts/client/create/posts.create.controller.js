'use strict';

//posts Create Controller
angular.module('posts')
    .controller('postsCreateController', ['$scope', '$state', 'Authentication', 'posts', 'postOptions', '$uibModal',
            function ($scope, $state, Authentication, posts, postOptions, $uibModal) {

            var vm = this;

            vm.authentification = Authentication;

            vm.error = null;

            vm.postOptions = postOptions;

            // Create new post

            vm.models = ['test'];

            vm.create = function (isValid) {

                vm.error = null;

                if (!isValid) {
                    $scope.$broadcast('show-errors-check-validity', 'postForm');

                    return false;
                }

                posts.create(vm.post).then(function (response) {
                    $state.go('posts.detail', {
                        postId: response._id
                    });
                }, function (err) {
                    vm.error = err.message;
                });
            };

            vm.modal = function (data) {

                var options = {};

                if (data === 'models') {
                    options = {
                        templateUrl: 'modules/models/client/views/list-models.client.view.html',
                        controller: 'ModelsListController',
                        controllerAs: 'vm',
                        resolve: {
                            modalState: function () {
                                return $scope.modalState = 'models.list';
                            }
                        }
                    };
                }
                else if (data === 'datasets') {
                    options = {
                        templateUrl: 'modules/datasets/client/list/datasets.list.html',
                        controller: 'DatasetsListController',
                        controllerAs: 'DataSetsList',
                        resolve: {
                            modalState: function () {
                                return $scope.modalState = 'models.list';
                            }
                        }
                    };
                }
                $uibModal.open(options).result.then(function (data) {
                    vm.post.models.push(data);
                });
            };

            }]);
