'use strict';

angular.module('process')
    .factory('Process', ['$http', function($http) {
      var currentProcess = null;
      var selectedDataset = null;

      return {
        setSelectedDataset: function(dataset) {
          selectedDataset = dataset;
        },
        getSelectedDataset: function() {
          return selectedDataset;
        },
        setSelectedProcess: function(process) {
          currentProcess = process;
        },
        getSelectedProcess: function() {
          return currentProcess;
        },
        getByUser: function(userId) {
          return $http({
            url: 'api/process/user/' + userId,
            method: 'GET'
          }).then(function(res) {
              return res.data;
          }, function (err) {
              console.log(err);
          });
        },
        create: function(process) {
          return $http({
            url: 'api/process',
            method: 'POST',
            data: {
              process: process
            }
          }).then(function(res) {
              return res.data;
          }, function (err) {
              console.log(err);
          });
        },
        update: function(process) {
          return $http({
            url: 'api/process/' + process._id,
            method: 'PUT',
            data: {
              process: process
            }
          }).then(function(res) {
            return res.data;
          }, function(err) {
            console.log(err);
          });
        },
        remove: function(process) {
          return $http({
            url: 'api/process/' + process._id,
            method: 'DELETE'
          }).then(function(res) {
              return res.data;
          }, function (err) {
              console.log(err);
          });
        }
      };
    }]);
