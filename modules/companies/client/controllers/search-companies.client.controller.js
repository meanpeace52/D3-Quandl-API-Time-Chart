/*global
 async
*/

(function () {
  'use strict';

  angular
    .module('companies')
    .controller('CompaniesSearchController', CompaniesSearchController);

  CompaniesSearchController.$inject = ['CompaniesService', '$stateParams', 'toastr', '$log', '$state'];

  function CompaniesSearchController(CompaniesService, $stateParams, toastr, $log, $state) {
    var vm = this;

    vm.query = $stateParams.query;

    vm.companies = [];

    async.parallel({
      companies: function(callback){
        CompaniesService.search(vm.query)
            .then(function(results){
              callback(null, results);
            })
            .catch(function(err){
              callback(err);
            });
      },
      statements: function(callback){
        CompaniesService.searchStatements(vm.query)
            .then(function(results){
              callback(null, results);
            })
            .catch(function(err){
              callback(err);
            });
      }
    }, function(err, results){
      if (err){
        $log.error(err);
        toastr.error('Error searching companies');
      }
      else{
        _.each(results.companies, function(company){
          vm.companies.push({ ticker: company.code, name : company.name });
        });

        _.each(results.statements, function(company){
          var foundcompany = _.find(vm.companies, { ticker : company.ticker });
          if (!foundcompany){
            vm.companies.push({ ticker: company.ticker, name : company.name });
          }
        });
      }
    });


    vm.search = function(){
      if (vm.query && vm.query !== ''){
        $state.go('companies.search', { query : vm.query });
      }
      else{
        toastr.error('Please enter a company name to search on.');
      }
    };
  }
}());
