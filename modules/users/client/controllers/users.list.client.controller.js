'use strict';

//users List Controller
angular.module('users')
    .controller('UsersListController', ['$state', '$sce', 'Authentication', 'Users', 'UsersFactory', 'toastr', '$stateParams',
            function ($state, $sce, Authentication, Users, UsersFactory, toastr, $stateParams) {
            var vm = this;

            vm.authentication = Authentication;
            vm.totalItems = 0;
            vm.currentPage = 1;
            vm.itemsPerPage = 50;
            vm.pageChanged = function(){
                loadSearchData();
            };

            if ($stateParams.query && $stateParams.query !== ''){
                vm.q = $stateParams.query;
                loadSearchData();
            }

            vm.search = function () {
                if (!vm.q || vm.q === ''){
                    toastr.error('You need to enter a value to search by.', 'Invalid input');
                    return;
                }

                $state.go('users.search', { query: vm.q });
            };

            function loadSearchData(){
                UsersFactory.search(vm.q, vm.itemsPerPage, vm.currentPage)
                    .success(function (response) {
                        vm.users = response.users;
                        vm.totalItems = response.count;
                    })
                    .error(function (error) {
                        console.log(error);
                    });
            }

            vm.showTitle = function (title) {
                var q = vm.q,
                    matcher = new RegExp(q, 'gi');
                var highlightedTitle = title.replace(matcher, '<span class="matched">$&</span>');
                console.log(highlightedTitle);
                return $sce.trustAsHtml(highlightedTitle);
            };

            /*vm.addToUser = function (dataset) {
                    users.addToUserApiCall()
                        .success(function (response) {
                            console.log(response);
                        })
                        .error(function (error) {
                            console.log(error);
                        });
                };
*/
            }]);
