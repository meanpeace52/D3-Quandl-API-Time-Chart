(function () {
  'use strict';

  describe('Models List Controller Tests', function () {
    // Initialize global variables
    var ModelsListController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      ModelsService,
      mockModel;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _ModelsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      ModelsService = _ModelsService_;

      // create mock post
      mockModel = new ModelsService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Model Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Models List controller.
      ModelsListController = $controller('ModelsListController as vm', {
        $scope: $scope
      });

      //Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockModelList;

      beforeEach(function () {
        mockModelList = [mockModel, mockModel];
      });

      it('should send a GET request and return all Models', inject(function (ModelsService) {
        // Set POST response
        $httpBackend.expectGET('api/models').respond(mockModelList);


        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.models.length).toEqual(2);
        expect($scope.vm.models[0]).toEqual(mockModel);
        expect($scope.vm.models[1]).toEqual(mockModel);

      }));
    });
  });
})();
