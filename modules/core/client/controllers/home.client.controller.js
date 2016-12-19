'use strict';

;(function () {

    var HomeController = function ($scope, Authentication, toastr, $state, posts, $log, $sce, CompaniesService) {

        var vm = this;

        vm.authentication = Authentication;

        vm.activeTab = 'Finance';

        vm.tabs = ['Finance', 'SoshSci'];

        vm.menuItems = ['Trending in TheoryLab', 'In The News', 'Most Accurate', 'From the Editor'];

        vm.news = [];

        vm.changeFinanceMenuItem = function(menuItem){
            vm.financeActiveMenuItem = menuItem;
            if (menuItem === 'In The News'){
                newsFeed();
            }
            else{
                posts.recent()
                    .then(function(posts){
                        vm.financePosts = posts;
                    })
                    .catch(function(err){
                        $log.error(err);
                        toastr.error('Error fetching posts.');
                    });
            }
        };

        if (vm.authentication.user){
            vm.changeFinanceMenuItem('Trending in TheoryLab');
        }

        vm.changeTab = function(item){
            vm.activeTab = item;
        };

        function newsFeed(){
            if (vm.news.length === 0){
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
        }

        vm.searchCompany = function(company){
            if (company.query && company.query !== ''){
                $state.go('companies.search', { query : company.query });
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
        .controller('HomeController', ['$scope', 'Authentication', 'toastr', '$state', 'posts', '$log', '$sce', 'CompaniesService', HomeController]);

})();
