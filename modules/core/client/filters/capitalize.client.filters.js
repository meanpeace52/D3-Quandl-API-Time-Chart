'use strict';

;(function () {

    var capitalize = function () {
        return function(input){
            if (input){
                if(input.indexOf(' ') !== -1){
                    var inputPieces,
                        i;

                    input = input.toLowerCase();
                    inputPieces = input.split(' ');

                    for(i = 0; i < inputPieces.length; i++){
                        inputPieces[i] = capitalizeString(inputPieces[i]);
                    }

                    return inputPieces.toString().replace(/,/g, ' ');
                }
                else {
                    input = input.toLowerCase();
                    return capitalizeString(input);
                }
            }
            else{
                return '';
            }


            function capitalizeString(inputString){
                return inputString.substring(0,1).toUpperCase() + inputString.substring(1);
            }
        };
    };

    angular.module('core')
        .filter('capitalize', ['$rootScope', '$window', capitalize]);

})();
