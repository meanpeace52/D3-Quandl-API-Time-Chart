'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
    function ($window) {
        var owasp = $window.owaspPasswordStrengthTest;

        owasp.configs = {
            minLength: 6,
            minOptionalTestsToPass: 1
        };

        owasp.tests.required = [];
        owasp.tests.optional = [
            // require at least one lowercase letter
            function(password) {
                if (!/[a-z]/.test(password)) {
                    return 'The password must contain at least one lowercase letter.';
                }
            },

            // require at least one uppercase letter
            function(password) {
                if (!/[A-Z]/.test(password)) {
                    return 'The password must contain at least one uppercase letter.';
                }
            },

            // require at least one number
            function(password) {
                if (!/[0-9]/.test(password)) {
                    return 'The password must contain at least one number.';
                }
            }
        ];

        return {
            getResult: function (password) {
                var result = owasp.test(password);
                return result;
            },
            getPopoverMsg: function () {
                var popoverMsg = 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
                return popoverMsg;
            }
        };
    }
]);
