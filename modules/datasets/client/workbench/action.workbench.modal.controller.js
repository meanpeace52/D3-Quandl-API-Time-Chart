'use strict';

angular.module('datasets')
    .controller('WorkbenchActionModalCtrl',
        ['$scope','$modalInstance', 'modalData', 'Datasets',
            function ($scope, $modalInstance, modalData, Datasets) {
                var vm = this;
                vm.actionForm = $scope.actionForm;
                vm.modalType = modalData.type;
                vm.modalTableData = modalData.tableData;
                vm.modalOperationData = modalData.operationData;
                vm.infoText = 'Table complete';

                vm.columns = [];
                vm.rows = [];

                vm.mergeParams = {};

                vm.hasLoadedDataErr = false;
                vm.hasLoadedData = true;
                vm.actionComplete = false;
                vm.inprogress = true;


                // need to disable submit btn 
                vm.isNameNotChange = vm.modalTableData.hasOwnProperty('title') ? true : false;

                switch (vm.modalType) {
                    case 'merge':
                        vm.title = 'Tables merging';
                        vm.btnTxt = 'Merge';
                        vm.notation = '(should be different from initial)';
                        if (vm.modalTableData.title) {
                            vm.mergeParams.tableName = vm.modalTableData.title;
                        }
                        mergeColumns(vm.modalOperationData).then(function (res) {
                            console.log('merge',res);
                            if (res && isDataCorrect(res)) {
                                vm.columns = res.columns;
                                vm.rows = res.rows;
                                vm.hasLoadedDataErr = false;
                            } else {
                                vm.hasLoadedDataErr = true;
                            }

                            vm.inprogress = false;
                            vm.hasLoadedData = false;
                        });

                    break;
                    case 'save':

                        console.log(vm.modalOperationData);
                        vm.title = 'Saving dataset';
                        vm.btnTxt = 'Save';
                        vm.notation = '(should be different from initial)';
                        if (vm.modalTableData.title) {
                            vm.mergeParams.tableName = vm.modalTableData.title;
                        }
                        saveDataset(vm.modalOperationData).then(function (res) {
                            console.log('save',res);
                            if (isDataCorrect(res)) {
                                vm.columns = res.columns;
                                vm.rows = res.rows;
                                vm.hasLoadedDataErr = false;
                            } else {
                                vm.hasLoadedDataErr = true;
                            }

                            vm.inprogress = false;
                            vm.hasLoadedData = false;
                        });

                    break;
                }

                vm.submit = function(valid) {
                    if(valid){
                        vm.inprogress = true;
                        vm.hasLoadedData = true;
                        var formData = getModalFormData();

                        switch (vm.modalType) {
                            case 'merge':
                                vm.modalOperationData.params.title = formData.name;
                                vm.modalOperationData.params.notice = formData.note;
                                vm.modalOperationData.params.action = 'insert';

                                mergeColumns(vm.modalOperationData).then(saveSuccess);
                            break;
                            case 'save':
                                var params = angular.extend(vm.modalOperationData, {title:formData.name,notice:formData.note});
                                params.action = 'insert';

                                saveDataset(params).then(saveSuccess);
                            break;
                        }
                    }

                    function saveSuccess () {
                        vm.actionComplete = true;
                        vm.hasLoadedData = false;
                        vm.infoText = 'Save complete';
                    }
                };

                vm.compareName = compareName;

                function compareName () {
                    if (vm.modalTableData.title) {
                        var name = getModalFormData().name;
                        vm.isNameNotChange = vm.modalTableData.title === name;
                    }
                }

                function getModalFormData () {
                    return {
                        name: vm.mergeParams.tableName ? vm.mergeParams.tableName.replace(/<\/?[^>]+(>|$)/g, '') : '',
                        note: vm.mergeParams.hasOwnProperty('notes') ? vm.mergeParams.notes.replace(/<\/?[^>]+(>|$)/g, '') : ''
                    };
                }


                function mergeColumns (params) {
                    return Datasets.mergeColumns(params).then(function (data) {
                        return data;
                    });                        
                }

                function saveDataset (params) {
                    // var formData = getModalFormData();
                    // var data = {
                    //     title: formData.name,
                    //     notice: formData.note,
                    //     action: 'insert',
                    //     id: vm.modalOperationData.id,
                    //     columns: vm.modalOperationData.columns,
                    // };
                    return Datasets.saveCustom(params).then(function (data) {
                        // vm.actionComplete = true;
                        // vm.inprogress = false;
                        console.log(data);
                        // getResultTabelData(data._id);
                        return data;
                    }, 
                    function (err) {
                        console.warn(err);
                    });
                }

                function getResultTabelData (newTabelId) {
                    Datasets.getDatasetWithS3(newTabelId).then(function (data) {
                        vm.hasLoadedData = true;
                        console.log('getResultTabelData',data);
                        if (isDataCorrect(data)) {
                            vm.columns = data.columns;
                            vm.rows = data.rows;
                            vm.hasLoadedDataErr = false;
                        } else {
                            vm.hasLoadedDataErr = true;
                        }
                        
                    });
                }

                function isDataCorrect (data) {
                    return data.hasOwnProperty('columns') && data.columns.length > 0;
                }

                vm.ok = function () {
                    $modalInstance.close(true);
                };

                vm.cancel = function () {
                    $modalInstance.dismiss(false);
                };

                
            }]);
