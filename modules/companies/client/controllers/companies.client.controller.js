/* global moment */

(function () {
    'use strict';



    // Companies controller
    angular
        .module('companies')
        .controller('CompaniesController', CompaniesController);

    CompaniesController.$inject = ['$scope', '$state', '$window', 'Authentication', '$stateParams', 'CompaniesService',
        'toastr', '$log', '$sce', 'Datasets'];

    function CompaniesController($scope, $state, $window, Authentication, $stateParams, CompaniesService, toastr, $log,
                                 $sce, Datasets) {
        var vm = this;

        vm.authentication = Authentication;

        vm.company = {};

        vm.displayeod = false;
        vm.displaystatements = false;
        vm.loading = true;
        vm.activePeriodTab = '';
        vm.periodList = ['5D', '1M', '6M', 'YTD', '1Y', '2Y', '5Y', '10Y', 'ALL'];
        vm.loadingEodData = false;

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

        vm.showEODData = function(period){
            var startDate = new Date(),
                endDate = new Date();

            vm.loadingEodData = true;

            vm.activePeriodTab = period;
            if (period !== 'ALL'){
                switch(period){
                    case '5D':
                        startDate = moment(startDate).subtract(5, 'days').toDate();
                        break;
                    case '1M':
                        startDate = moment(startDate).subtract(1, 'months').toDate();
                        break;
                    case '6M':
                        startDate = moment(startDate).subtract(6, 'months').toDate();
                        break;
                    case 'YTD':
                        startDate = moment(startDate).startOf('year').toDate();
                        break;
                    case '1Y':
                        startDate = moment(startDate).subtract(1, 'years').toDate();
                        break;
                    case '2Y':
                        startDate = moment(startDate).subtract(2, 'years').toDate();
                        break;
                    case '5Y':
                        startDate = moment(startDate).subtract(6, 'years').toDate();
                        break;
                    case '10Y':
                        startDate = moment(startDate).subtract(10, 'years').toDate();
                        break;
                }

                vm.rows = _.filter(vm.company.eod.dataset.data, function(row){
                    var date = new Date(row[0]);
                    return date >= startDate && date <= endDate;
                });
            }
            else{
                vm.rows = vm.company.eod.dataset.data;
            }

            vm.transformedRows = [];
            _.each(vm.rows, function(row){
                var index = 0;
                var newRow = {};
                _.each(vm.company.eod.dataset.column_names, function(name){
                    newRow[name] = row[index];
                    index++;
                });
                vm.transformedRows.push(newRow);
            });
            vm.loadingEodData = false;
        };

        vm.saveDataset = function(){
            Datasets.showTitleModal(vm.company.eod.dataset.name + ' ' + vm.activePeriodTab + ' - ' + moment().format('MM/DD/YYYY, h:mm:ss a'), function(result) {
                Datasets.json2csvinsert({
                    title: result.title,
                    rows: vm.transformedRows,
                    columns: vm.company.eod.dataset.column_names
                })
                    .then(function () {
                        toastr.success('The dataset has been copied to your page.');
                    })
                    .catch(function (err) {
                        $log.error(err);
                        toastr.error('Error saving dataset.');
                    });
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
