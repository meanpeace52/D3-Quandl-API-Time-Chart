'use strict';

// EmailVerificationService used for asking a new email verification
angular.module('users').factory('EmailVerificationService', ['$http', 'Authentication', 'toastr',
  function ($http, Authentication, toastr) {
    return {
      verifyEmail : function(next){
        $http.get('/api/users/verifyemail').then(function successCallback(response) {
          next();
        }, function errorCallback(err) {
          next(err);
          toastr.error('Could not send verification email');
        });
      }
    };
  }
]);
