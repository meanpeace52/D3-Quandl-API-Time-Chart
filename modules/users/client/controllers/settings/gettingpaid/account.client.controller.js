'use strict';

angular.module('users').controller('ManagedAccountController', ['$scope','Authentication','BillingService','$uibModal','toastr',
  function ($scope,Authentication,BillingService,$uibModal,toastr) {
    $scope.user = Authentication.user;
    $scope.legal_entity = {address:{},type:'individual',first_name:Authentication.user.firstName, last_name:Authentication.user.lastName};
    $scope.external_account = {};
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
    var states = 'AK,AL,AR,AZ,CA,CO,CT,DC,DE,FL,GA,HI,IA,ID,IL,IN,KS,KY,LA,MA,MD,ME,MI,MN,MO,MS,MT,NC,ND,NE,NH,NJ,NM,NV,NY,OH,OK,OR,PA,PR,RI,SC,SD,TN,TX,UT,VA,VT,WA,WI,WV,WY';
    $scope.states = states.split(',');
    $scope.legal_entity.address.state = $scope.states[0];
    $scope.selectType = function(type){
      $scope.legal_entity.type = type.value;
      $scope.type = type;
    };

    $scope.validate = function(form){
      if (!form.$valid){
        $scope.submitted = true;
        toastr.error('Please fix the errors before you can continue.');
        $scope.$broadcast('show-errors-check-validity', 'form');
      } else {
        var fields = ['personal_id_number','ssn_last_4','business_name','business_tax_id','type','first_name','last_name','address'];

        if($scope.legal_entity.business_name === null) delete $scope.legal_entity.business_name;
        var legal_entity = {};
        for (var i = 0; i < fields.length; i++) {
          if($scope.legal_entity[fields[i]]) legal_entity[fields[i]] = $scope.legal_entity[fields[i]];
        }

        if(typeof $scope.legal_entity.dob !== 'string') legal_entity.dob = {
          month: $scope.legal_entity.dob.month,
          day: $scope.legal_entity.dob.day,
          year: $scope.legal_entity.dob.year
        };

        if($scope.register){
          $scope.accountLoaded = false;
          BillingService.createAccount({
            legal_entity:legal_entity,
            external_account:$scope.external_account,
            meta:{type:$scope.type.code}
          },
            function (err, account) {
              if(err){
                $scope.accountLoaded = true;
              }else {
                initAccountInfo(account);
              }
          });
        } else {
          $scope.accountLoaded = false;
          BillingService.updateAccount({legal_entity:legal_entity,meta:{type:$scope.type.code}},
            function (err, account) {
              if(err){
                $scope.accountLoaded = true;
              }else {
                initAccountInfo(account);
              }
          });
        }

      }
    };

    BillingService.getAccount(function successCallback(err, account) {
      initAccountInfo(account);
    });


    function initAccountInfo(account){
      if(account.id) {
        $scope.verification = account.verification;
        var dob = account.legal_entity.dob;
        account.legal_entity.dob = dob.month +'/'+dob.day+'/'+ dob.year;
        $scope.legal_entity = account.legal_entity;
        if(account.external_accounts.data.length) {
          $scope.external_account = account.external_accounts.data[0];
        }
        for (var i = 0; i < $scope.businessTypes.length; i++) {
          if($scope.businessTypes[i].code == account.metadata.type){
            $scope.legal_entity.type = $scope.businessTypes[i].value;
            $scope.type = $scope.businessTypes[i];
          }
        }
        $scope.register = false;
      } else {
        $scope.register = true;
      }
      $scope.accountLoaded = true;
    }
  }
]);
