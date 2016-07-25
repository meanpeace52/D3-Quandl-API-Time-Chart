'use strict';

//users List Controller
angular.module('users')
    .controller('UsersListController', ['$state', '$sce', 'Authentication', 'Users', 'UsersFactory',
            function ($state, $sce, Authentication, Users, UsersFactory) {
            var vm = this;

            vm.authentication = Authentication;

            vm.search = function () {
                UsersFactory.search(vm.q)
                    .success(function (response) {
                        vm.users = response;
                    })
                    .error(function (error) {
                        console.log(error);
                    });
            };

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
