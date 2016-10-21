'use strict';

angular.module('users').controller('EmailVerificationController', ['$scope', '$stateParams', 'EmailVerificationService', 'Authentication',
  function ($scope, $stateParams, EmailVerificationService, Authentication) {
    $scope.user = Authentication.user;


    $scope.verify = function(){
      EmailVerificationService.verifyEmail(function(err){
        if(!err){
          $scope.emailsent = true;
        }
      });
    };

  }
]);
