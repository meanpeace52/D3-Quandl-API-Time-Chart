'use strict';

angular.module('datasets')
    .directive('datasetTable', [function() {
      var baseTpl = '   <table class="table table-striped table-bordered">';
          baseTpl += '    <thead>';
          baseTpl += '        {{#each columns}}';
          baseTpl += '	        	<th>{{this}}<\/th>';
          baseTpl += '        {{\/each}}';
          baseTpl += '    <\/thead>';
          baseTpl += '    <tbody>';
          baseTpl += '      {{> rows}}';
          baseTpl += '    <\/tbody>';
          baseTpl += '  <\/table>';

      var partial = '  {{#each rows}}';
          partial += '    <tr>';
          partial += '		  {{#each ..\/columns}}';
          partial += '			  <td>{{lookup ..\/this this}}<\/td>';
          partial += '		  {{\/each}}';
          partial += '    <\/tr>';
          partial += ' {{\/each}}';

      var tpl = Handlebars.compile(baseTpl);
      Handlebars.registerPartial('rows', partial);

      return {
        restrict: 'E',
        scope: {
          rows: '=',
          columns: '='
        },
        link: function($scope, element) {
          $scope.$watchGroup(['columns', 'rows'], function(newData) {
            if (newData[0] && newData[1] && newData[0].length && newData[1].length) {
              element.html(tpl({
                columns: newData[0],
                rows: newData[1]
              }));
            } else {
              element.html('');
            }
          });
        }
      };
    }]);
