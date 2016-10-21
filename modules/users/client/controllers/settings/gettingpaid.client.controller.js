'use strict';

angular.module('users').controller('GettingPaidController', ['$scope','Authentication','BillingService','$uibModal','toastr',
  function ($scope,Authentication,BillingService,$uibModal,toastr) {
    $scope.user = Authentication.user;
    $scope.legal_entity = {address:{},type:'individual'};
    $scope.countries = [
      {code:'AU', name:'Australia'},
      {code:'AT', name:'Austria'},
      {code:'BE', name:'Belgium'},
      {code:'CA', name:'Canada'},
      {code:'DK', name:'Denmark'},
      {code:'FI', name:'Finland'},
      {code:'FR', name:'France'},
      {code:'DE', name:'Germany'},
      {code:'HK', name:'Hong Kong'},
      {code:'IE', name:'Ireland'},
      {code:'IT', name:'Italy'},
      {code:'JP', name:'Japan'},
      {code:'LU', name:'Luxembourg'},
      {code:'NL', name:'Netherlands'},
      {code:'NO', name:'Norway'},
      {code:'PT', name:'Portugal'},
      {code:'SG', name:'Singapore'},
      {code:'ES', name:'Spain'},
      {code:'SE', name:'Sweden'},
      {code:'GB', name:'United Kingdom'},
      {code:'US', name:'United States'}
    ];
    $scope.country = $scope.countries[$scope.countries.length-1];

    $scope.businessTypes = [
      {code:'corporation', name:'Corporation', value:'company'},
      {code:'sole_prop', name:'Individual / Sole Proprietorship', value:'individual'},
      {code:'non_profit', name:'Non-profit', value:'company'},
      {code:'partnership', name:'Partnership', value:'company'},
      {code:'llc', name:'LLC', value:'company'}
    ];
    $scope.type = $scope.businessTypes[1];
    var states = 'AK,AL,AR,AZ,CA,CO,CT,DC,DE,FL,GA,HI,IA,ID<,IL,IN,KS,KY,LA,MA,MD,ME,MI,MN,MO,MS,MT,NC,ND,NE,NH,NJ,NM,NV,NY,OH,OK,OR,PA,PR,RI,SC,SD,TN,TX,UT,VA,VT,WA,WI,WV,WY';
    $scope.states = states.split(',');
    $scope.legal_entity.address.state = $scope.states[0];
    $scope.selectType = function(type){
      $scope.legal_entity.type = type.value;
    };
    $scope.validate = function(form){
      if (!form.$valid){
        $scope.submitted = true;
        toastr.error('Please fix the errors before you can continue.');
        $scope.$broadcast('show-errors-check-validity', 'form');
      } else {
        delete $scope.legal_entity.dob.text;
        if($scope.legal_entity.personal_id_number) delete $scope.legal_entity.ssn_last_4;
        BillingService.createAccount($scope.legal_entity, function successCallback(response) {

        });
      }
    };

    BillingService.getAccount($scope.legal_entity, function successCallback(account) {
      if(account.id) {
        $scope.legal_entity = account.legal_entity;
      }
    });
  }
]);
