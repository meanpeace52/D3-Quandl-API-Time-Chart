(function () {
    'use strict';

    // Companies controller
    angular
        .module('companies')
        .controller('CompaniesController', CompaniesController);

    CompaniesController.$inject = ['$scope', '$state', '$window', 'Authentication', '$stateParams', 'CompaniesService',
        'toastr', '$log', '$sce'];

    function CompaniesController($scope, $state, $window, Authentication, $stateParams, CompaniesService, toastr, $log, $sce) {
        var vm = this;

        vm.authentication = Authentication;

        vm.company = {};

        vm.displayeod = false;
        vm.displaystatements = false;

        vm.changePeriod = function (period) {
            vm.statements = _.filter(vm.company.statements.statements, {date: period});
            _.each(vm.statements, function (statement) {
                statement.displayname = statement.type.replace(/([A-Z])/g, ' $1').trim();
            });
            if (vm.statements.length){
                vm.loadStatement(vm.statements[0]);
            }
        };

        vm.loadStatement = function (statement) {
            vm.statement = null;


            CompaniesService.getstatement(statement)
                .then(function(results){
                    vm.statement = $sce.trustAsHtml(results);
                    vm.statementname = statement.displayname;
                })
                .catch(function(err){
                    $log.error(err);
                    toastr.error('Error loading statement.');
                });
        };

        CompaniesService.findbycode($stateParams.companyId)
            .then(function (eod) {
                vm.company.eod = eod;
                vm.displayeod = true;
                if (vm.company.eod.dataset) {
                    vm.company.eod.dataset.name = vm.company.eod.dataset.name.replace(' Prices, Dividends, Splits and Trading Volume', '');
                }
            })
            .catch(function (err) {
                $log.error(err);
                //toastr.error('Error searching companies');
            });

        CompaniesService.searchStatementsByTicker($stateParams.companyId)
            .then(function (result) {
                vm.company.statements = result;
                vm.displaystatements = true;
                vm.periods = _.chain(vm.company.statements.statements)
                    .map(function (statement) {
                        return statement.date;
                    })
                    .uniq()
                    .reverse()
                    .value();
                if (vm.periods.length > 0){
                    vm.period = vm.periods[0];
                    vm.changePeriod(vm.period);
                }
            })
            .catch(function (err) {
                $log.error(err);
                //toastr.error('Error searching company statements');
            });
    }
}());
