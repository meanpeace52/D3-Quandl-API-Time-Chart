'use strict';

angular.module('users').controller('EmailVerificationController', ['$scope', '$state', 'EmailVerificationService', 'Authentication',
  function ($scope, $state, EmailVerificationService, Authentication) {
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
