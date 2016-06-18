'use strict';

angular.module('process')
    .controller('ProcessModalController',
        ['$modalInstance',
            function ($modalInstance) {
                var vm = this;

        vm.copiedTasks = [];
        vm.tasks = [{
          title: 'Task1',
          subtasks: [{
            title: '1-subtask1'
          }, {
            title: '1-subtask2',
          }, {
            title: '1-subtask3',
          }, {
            title: '1-subtask4',
          }]
        },{
          title: 'Task2',
          subtasks: [{
            title: '2-subtask1'
          }, {
            title: '2-subtask2',
          }, {
            title: '2-subtask3',
          }, {
            title: '2-subtask4',
          }]
        },{
          title: 'Task3',
          subtasks: [{
            title: '3-subtask1'
          }, {
            title: '3-subtask2',
          }, {
            title: '3-subtask3',
          }, {
            title: '3-subtask4',
          }]
        },{
          title: 'Task4',
          subtasks: [{
            title: '4-subtask1'
          }, {
            title: '4-subtask2',
          }, {
            title: '4-subtask3',
          }, {
            title: '4-subtask4',
          }]
        }];

        vm.onCopy = function(event, index, item) {
          if (!_.find(vm.copiedTasks, item)) {
            vm.copiedTasks.splice(index, 0, item);
          }
          return true;
        };
    }]);
