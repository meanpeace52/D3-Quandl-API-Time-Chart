'use strict';

angular.module('process')
    .factory('Process', ['$http', function($http) {
      var currentProcess = null;
      var selectedDataset = null;
      var usersDatasets = null;

      return {
        setUsersDatasets: function(datasets) {
          usersDatasets = datasets;
        },
        getUsersDatasets: function() {
          return usersDatasets;
        },
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
        getByUser: function(datasetId, userId) {
          return $http({
            url: 'api/process/user/' + userId + '?dataset=' + datasetId,
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
