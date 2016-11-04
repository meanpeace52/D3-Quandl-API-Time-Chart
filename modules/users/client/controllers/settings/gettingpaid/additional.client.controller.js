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
        return '|jpg|png|jpeg|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if(fileItem._file.size <= 4*1024*1024){
        $scope.uploader.uploadAll();
        $scope.uploading = true;
      } else{
        $scope.fileError = 'Sorry this file is too large, maximum 4MB are allowed';
      }
    };

    $scope.uploader.onWhenAddingFileFailed = function (fileItem){
      toastr.error('Sorry this file type is not allowed.');
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      $scope.fileUploadSuccess = true;
      $scope.uploading = false;
      $scope.accountUpdated = true;
      initAccountInfo(response);
    };

    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      toastr.error(response.message);
      $scope.uploading = false;
    };


    $scope.validate = function(form){
      if (!form.$valid){
        $scope.submitted = true;
        toastr.error('Please fix the errors before you can continue.');
        $scope.$broadcast('show-errors-check-validity', 'form');
      } else {
        $scope.submitting = true;
        $scope.accountLoaded = false;
        BillingService.updateAccount({legal_entity:{personal_id_number:$scope.legal_entity.personal_id_number}},
          function (err, account) {
            if(err){
              $scope.accountLoaded = true;
              $scope.submitting = false;
            } else {
              initAccountInfo(account);
              $scope.accountUpdated = true;
            }
        });
      }
    };

    BillingService.getAccount(function (err, account) {
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
