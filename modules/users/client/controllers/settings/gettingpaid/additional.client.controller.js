'use strict';

angular.module('users').controller('GettingPaidAdditionalController', ['$scope','Authentication','BillingService','$timeout','toastr', 'FileUploader',
  function ($scope, Authentication, BillingService, $timeout, toastr, FileUploader) {

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/account/document',
      alias: 'newAccountDocument'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|pdf|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if(fileItem._file.size <= 4*1024*1024){
        $scope.uploader.uploadAll();
        $scope.uploading = true;
      } else{
        $scope.fileError = "Sorry this file is too large, maximum 4MB are allowed";
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      $scope.fileUploadSuccess = true;
      $scope.uploading = false;
      initAccountInfo(response);
    };

    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      $scope.uploading = false;
    };


    BillingService.getAccount(function successCallback(err, account) {
      initAccountInfo(account);
    });


    function initAccountInfo(account){
      if(account.id) {
        $scope.verification = account.verification;
        $scope.legal_entity = account.legal_entity;
        $scope.register = false;
      } else {
        $scope.register = true;
      }
      $scope.accountLoaded = true;
    }

  }
]);
