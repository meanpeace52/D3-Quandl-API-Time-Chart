'use strict';

;(function () {

    var HomeController = function ($scope, Authentication, toastr, $state) {

        var vm = this;

        vm.authentication = Authentication;

        vm.activeTab = 'Finance';

        vm.tabs = ['Finance', 'SoshSci'];

        vm.changeTab = function(item){
            vm.activeTab = item;
        };

        vm.searchCompany = function(company){
            if (company.query && company.query !== ''){

            }
            else{
                toastr.error('Please enter a company name to search on.');
            }
        };

        vm.searchPosts = function(post){
            if (post.query && post.query !== ''){
                $state.go('posts.search', { field : 'title', value : post.query });
            }
            else{
                toastr.error('Please enter a keyword to search on.');
            }
        };

    };

    angular.module('core')
        .controller('HomeController', ['$scope', 'Authentication', 'toastr', '$state', HomeController]);

})();
