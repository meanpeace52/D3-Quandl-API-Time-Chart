'use strict';

(function () {
  // posts Controller Spec
  describe('posts Controller Tests', function () {
    // Initialize global variables
    var postsController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Posts,
      mockpost;

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
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _posts_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Posts = _posts_;

      // create mock post
      mockpost = new Posts({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An post about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the posts controller.
      postsController = $controller('postsController as vm', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one post object fetched from XHR', inject(function (posts) {
      // Create a sample posts array that includes the new post
      var sampleposts = [mockpost];

      // Set GET response
      $httpBackend.expectGET('api/posts').respond(sampleposts);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.posts).toEqualData(sampleposts);
    }));

    it('$scope.findOne() should create an array with one post object fetched from XHR using a postId URL parameter', inject(function (posts) {
      // Set the URL parameter
      $stateParams.postId = mockpost._id;

      // Set GET response
      $httpBackend.expectGET(/api\/posts\/([0-9a-fA-F]{24})$/).respond(mockpost);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.post).toEqualData(mockpost);
    }));

    describe('$scope.create()', function () {
      var samplepostPostData;

      beforeEach(function () {
        // Create a sample post object
        samplepostPostData = new Posts({
          title: 'An post about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An post about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (posts) {
        // Set POST response
        $httpBackend.expectPOST('api/posts', samplepostPostData).respond(mockpost);

        // Run controller functionality
        scope.create(true);
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the post was created
        expect($location.path.calls.mostRecent().args[0]).toBe('posts/' + mockpost._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/posts', samplepostPostData).respond(400, {
          message: errorMessage
        });

        scope.create(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock post in scope
        scope.post = mockpost;
      });

      it('should update a valid post', inject(function (posts) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/posts\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/posts/' + mockpost._id);
      }));

      it('should set scope.error to error response message', inject(function (posts) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/posts\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(post)', function () {
      beforeEach(function () {
        // Create new posts array and include the post
        scope.posts = [mockpost, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/posts\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockpost);
      });

      it('should send a DELETE request with a valid postId and remove the post from the scope', inject(function (posts) {
        expect(scope.posts.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.post = mockpost;

        $httpBackend.expectDELETE(/api\/posts\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to posts', function () {
        expect($location.path).toHaveBeenCalledWith('posts');
      });
    });
  });
}());
