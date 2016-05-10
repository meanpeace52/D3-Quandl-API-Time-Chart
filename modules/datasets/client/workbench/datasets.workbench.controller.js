'use strict';

//Datasets Detail Controller
angular.module('datasets')
    /**
     * This wrapper is only used to compile custom title with checkbox
     */
    .directive('datatableWrapper', function datatableWrapper($timeout, $compile) {
        return {
            restrict: 'E',
            transclude: true,
            template: '<ng-transclude></ng-transclude>',
            link: link
        };

        function link(scope, element) {
            $timeout(function () {
                $compile(element.find('.title-radio-label'))(scope);
                $compile(element.find('.title-checkbox-label'))(scope);
            }, 0, false);
        }
    })
    .directive('labelRadio', function () {
        return {
            restrict: 'A',
            link: link
        };

        function link(scope, element) {
            element.bind('click', function(event) {
                event.stopPropagation();
                event.preventDefault();
                element.children().prop('checked', true);
            });
        }
    })
    
    .controller('WorkbenchController',
        ['$scope','$stateParams', '$state', '$modal', 'Datasets', 'UsersFactory', 'Authentication', 'DTOptionsBuilder', 'DTColumnDefBuilder',
            function ($scope, $stateParams, $state, $modal, Datasets, UsersFactory, Authentication, DTOptionsBuilder, DTColumnDefBuilder) {
                var vm = this;

				vm.authentication = Authentication;
				vm.user = Authentication.user;
                vm.mergeParams = {};
                vm.checkedPriColumns = {};

                vm.ds1 = {
                    data: null, 
                    hasLoadedData: false,
                    tableOptions: null,
                    tableColumnDefs: [
                        DTColumnDefBuilder.newColumnDef(0).notSortable()
                    ],
                    _id: $stateParams.ds1,
                };
				vm.ds2 = {
                    data: null, 
                    hasLoadedData: false,
                    tableOptions: null,
                    tableColumnDefs: null,
                    _id: $stateParams.ds2,
                };
				vm.usersDatasets = [];

                $scope.$watch('$stateParams', function(newvalue) {
                        if (newvalue) {
                            console.log(newvalue);
                        }
                    }
                );


                function getDataset(container) {
                    var vmContainer = vm[container];
                    if (vmContainer && vmContainer._id) {
                        vmContainer.hasLoadedData = false;
                        Datasets.crud.get({datasetId: vmContainer._id})
                            .$promise.then(function (dataset) {
                                vmContainer.data = dataset;
                                return dataset._id;
                            })
                            .then(Datasets.getDatasetWithS3.bind(Datasets))
                            .then(function (data) {
                                vmContainer.columns = data.columns;
                                vmContainer.rows = data.rows;
                                vmContainer.tableColumnDefs = _.map(data.columns, function (col, i) {
                                    col = col.replace(/"/ig, '');
                                    var text = '<label class="title-radio-label">'+
                                                    '<input type="radio" class="title-radio" name="primaryCol_'+container+'" value="'+col+'" ng-model="Workbench.mergeParams.primaryCol.'+container+'">'+
                                                    col+
                                                '</label>'+
                                                '<label class="title-checkbox-label">'+
                                                    '<input type="checkbox" class="title-checkbox" name="col_'+col+'_'+container+'" value="'+col+'" ng-model="Workbench.checkedColumns.'+col+'_'+container+'" ng-init="Workbench.checkedColumns.'+col+'_'+container+'=true">'+
                                                '</label>';

                                    return DTColumnDefBuilder.newColumnDef(i).withTitle(text).notSortable();
                                });
                                vmContainer.tableOptions = DTOptionsBuilder.newOptions()
                                    .withOption('drawCallback', function (settings) { 
                                        var api = new $.fn.dataTable.Api( settings );
                                        var $tabel = $(api.table().node());
                                        $tabel.find('label').remove();
                                     })
                                    .withOption('lengthChange', false)
                                    .withOption('sort', false)
                                    .withOption('paging', false)
                                    .withOption('scrollY', '450px')
                                    .withOption('scrollX', '100%');
                                vmContainer.hasLoadedData = true;
                            });
                    }
                }

                UsersFactory.finduserdatasets(vm.user).then(function (usersDatasets) {
                	vm.usersDatasets = usersDatasets;
                });

                getDataset('ds1');
                getDataset('ds2');

                vm.addtoUser = function () {
                    Datasets.addToUserApiCall(vm.viewingDataset);
                };

                vm.loadDataset = function (container) {
                    vm[container]._id = vm[container].data._id;
                    $state.go('datasets.workbench', {
                        ds1: vm.ds1._id,
                        ds2: vm.ds2._id,
                    }, {
                        location: 'replace',
                        reload: false,
                        notify: false
                    });
                    getDataset(container);
                };

                vm.saveChanges = function (tableData, container) {
                    var checkedColumns = vm.checkedColumns;
                    var columns = checkedCol(container);
                    console.log(columns,checkedColumns, vm[container]);
                    if (columns.length && vm[container].columns.length > columns.length) {
                        // Datasets.saveCustom({id:tableData._id,columns:columns});
                        var curDataset = getUserDatasetById(vm[container]._id);
                        var operationData = {
                            id: tableData._id,
                            columns: columns,
                            action: 'show'
                        };

                        vm.showActionModal('save', {title:curDataset ? curDataset.title : null}, operationData);

                    } else {
                        console.info('No data to send');
                        vm.showMessage( {type:'alert',msg:['Not enought data to save dataset']} );
                    }
                }

                vm.showMessage = function (dataset) {
                    if (dataset) {
                        var modalInstance = $modal.open({
                            templateUrl: 'modules/datasets/client/workbench/datasets.workbench.modal.html',
                            controller: 'DatasetsWorkbenchModalController',
                            controllerAs: 'DatasetWorkbenchModal',
                            size: 'md',
                            resolve: {
                                mergeData: dataset
                            }
                        });
                    }
                };

                vm.showActionModal = function (type,tableData,operationData) {

                    var modalInstance = $modal.open({
                        templateUrl: 'modules/datasets/client/workbench/action.workbench.modal.html',
                        controller: 'WorkbenchActionModalCtrl',
                        controllerAs: 'ActionModalCtrl',
                        size: 'md',
                        resolve: {
                            modalData: {type:type,tableData:tableData,operationData:operationData}
                        }
                    });
                    
                }

                vm.mergeColumns = function () {
                    var params = vm.mergeParams;
                    var ids = window.location.pathname.split('/').slice(-2);
                    var tables = {ds1:ids[0],ds2:ids[1]};
                    var msg = {msg:'',type:'alert'};
                    var operationData = {
                        params: {
                            type: +vm.mergeParams.type,
                            action: 'show'
                        },
                        datasets: createDatasets(params, tables),
                    }

                    var isErrObj = checkMergeData(params,operationData);
                    if ( isErrObj ) {
                        isErrObj.type = 'alert';
                        vm.showMessage( isErrObj );
                        return;
                    } else {
                        var curDataset = getUserDatasetById(operationData.datasets[0].id);
                        vm.showActionModal('merge',{title:curDataset ? curDataset.title : null},operationData);
                    }

                }

                 function checkMergeData (params, data) {
                    var err = {msg:[]};

                    switch (true) {
                        case ( _.isEmpty(params) ):
                            err.msg.push('Please check merge parameters');
                            return err;
                        case (params.type !== '0' && params.type !== '1'):
                            err.msg.push('Please check merge type');
                            return err;
                        case (!params.primaryTable):
                            err.msg.push('Please check primary table for merge');
                            return err;
                    }

                    for (var i = 0; i < data.datasets.length; i++) {
                        var isError = false;
                        if (!data.datasets[i].primary) {
                            err.msg.push('Please check primary column in both tables');
                            isError = true;
                        }
                        // console.log(params, data);
                        if (data.datasets[i].cols.length <= 1) {
                            err.msg.push('Please check columns for merge in both tables (min 2 checked columns in the each table)');
                            isError = true;
                        }
                        
                        if (isError) return err;
                    }
                    return err.msg.length ? err : false;
                 }

                function createDatasets (params, tables) {
                    var datasets = [];
                    if ( _.isEmpty(params) ) return;

                    for ( var tableName in tables ) {
                        if ( tables.hasOwnProperty(tableName) ) {

                            var dataObj = {
                                id: tables[tableName],
                                cols: checkedCol(tableName),
                                primary: ('primaryCol' in params) ? params.primaryCol[tableName] : null
                            }

                            // if cheked primary column and no other column cheked, add primary column name to columns array
                            if ( dataObj.primary && (dataObj.cols.length <= 1 && dataObj.cols.indexOf(dataObj.primary) < 0) ) {
                                dataObj.cols.push(dataObj.primary);
                            }
                            console.log(dataObj);
                            if (dataObj.id == tables[params.primaryTable]) {
                                datasets.splice(0,0,dataObj); // add primary table to array [0]
                            } else {
                                datasets.push(dataObj);
                            }
                        }
                    }

                    return datasets;
                }

                function splitColName(column) {
                    if (!column && typeof column !== 'string') return false;
                    return column.split('_');
                }

                function getColNameForTable (colName, columnsObj, tableName) {
                    var pathOfColName = splitColName(colName);
                    return (pathOfColName[1] === tableName) && columnsObj[colName] && pathOfColName[0];
                }

                function getUserDatasetById (id) {
                    return _.find(vm.usersDatasets,{_id:id});
                }

                function checkedCol (tableName,colCount) {
                    var checkedColumns = vm.checkedColumns;
                    var columns = [];
                    for (var col in checkedColumns) {
                        if ( checkedColumns.hasOwnProperty(col) ) {
                            var colName = getColNameForTable(col,checkedColumns,tableName);
                            if (colName) {
                                columns.push(colName);
                            }
                        }
                    }

                    return columns; 
                }


                function checkFillData () {

                }


            }]);