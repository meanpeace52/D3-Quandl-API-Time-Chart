'use strict';

angular.module('process')
    .controller('MergeTaskOptionsController', ['$stateParams', function($stateParams) {

      var vm = this;
      vm.options = $stateParams.options || {};
    }]);
