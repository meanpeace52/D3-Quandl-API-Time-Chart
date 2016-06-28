'use strict';

angular.module('process')
    .controller('ModelModalController',
        ['$state', '$stateParams', 'model',
          function ($state, $stateParams, model) {
            var vm = this;

        vm.model = model;

    }]);
