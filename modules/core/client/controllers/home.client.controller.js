'use strict';

;(function () {

    var HomeController = function ($scope, Authentication, toastr, $state, posts, $log, $sce) {

        var vm = this;

        vm.authentication = Authentication;

        vm.activeTab = 'Finance';

        vm.tabs = ['Finance', 'SoshSci'];

        vm.changeTab = function(item){
            vm.activeTab = item;
        };

        function newsFeed(){
            posts.getRepubhubFeed()
                .then(function(news){
                    vm.news = news.items;
                    _.each(vm.news, function(item){
                        item.title = $sce.trustAsHtml(item.title);
                        item.created = new Date(item.created);
                    });
                })
                .catch(function(err){
                    $log.error(err);
                    toastr.error('Error fetching news.');
                });
        }

        if (vm.authentication.user){
            newsFeed();
        }

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
        .controller('HomeController', ['$scope', 'Authentication', 'toastr', '$state', 'posts', '$log', '$sce', HomeController]);

})();
