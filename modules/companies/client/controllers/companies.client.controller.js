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
        vm.loading = true;

        vm.changePeriod = function (period) {
            var statement = _.find(vm.company.statements.statements, {date: period, displayname : vm.selectedstatement });

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

        vm.loadStatement = function (statement) {
            vm.selectedstatement = statement;
            vm.periods = [];
            vm.periods = _.chain(vm.company.statements.statements)
                            .filter({ displayname : statement })
                            .map(function(statement){
                                return statement.date;
                            })
                            .reverse()
                            .value();

            if (vm.periods.length){
                vm.period = vm.periods[0];
                vm.changePeriod(vm.period);
            }
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
            });

        CompaniesService.searchStatementsByTicker($stateParams.companyId)
            .then(function (result) {
                vm.company.statements = result;
                vm.displaystatements = true;
                vm.loading = false;

                _.each(vm.company.statements.statements, function (statement) {
                    statement.displayname = statement.type.replace(/([A-Z])/g, ' $1').trim();
                });

                vm.statementslist = _.chain(vm.company.statements.statements)
                                    .map(function (statement) {
                                        return statement.displayname;
                                    })
                                    .uniq()
                                    .value();

                if (vm.statementslist.length){
                    vm.loadStatement(vm.statementslist[0]);
                }

            })
            .catch(function (err) {
                $log.error(err);
            });
    }
}());
