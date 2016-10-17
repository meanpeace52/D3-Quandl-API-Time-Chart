(function () {
  'use strict';

  /*
  describe('Models Route Tests', function () {
    // Initialize global variables
    var $scope,
      ModelsService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ModelsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ModelsService = _ModelsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('models');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/models');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          ModelsController,
          mockModel;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('models.view');
          $templateCache.put('modules/models/client/views/view-model.client.view.html', '');

          // create mock Model
          mockModel = new ModelsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Model Name'
          });

          //Initialize Controller
          ModelsController = $controller('ModelsController as vm', {
            $scope: $scope,
            modelResolve: mockModel
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:modelId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.modelResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            modelId: 1
          })).toEqual('/models/1');
        }));

        it('should attach an Model to the controller scope', function () {
          expect($scope.vm.model._id).toBe(mockModel._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/models/client/views/view-model.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          ModelsController,
          mockModel;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('models.create');
          $templateCache.put('modules/models/client/views/form-model.client.view.html', '');

          // create mock Model
          mockModel = new ModelsService();

          //Initialize Controller
          ModelsController = $controller('ModelsController as vm', {
            $scope: $scope,
            modelResolve: mockModel
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.modelResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/models/create');
        }));

        it('should attach an Model to the controller scope', function () {
          expect($scope.vm.model._id).toBe(mockModel._id);
          expect($scope.vm.model._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/models/client/views/form-model.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          ModelsController,
          mockModel;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('models.edit');
          $templateCache.put('modules/models/client/views/form-model.client.view.html', '');

          // create mock Model
          mockModel = new ModelsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Model Name'
          });

          //Initialize Controller
          ModelsController = $controller('ModelsController as vm', {
            $scope: $scope,
            modelResolve: mockModel
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:modelId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.modelResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            modelId: 1
          })).toEqual('/models/1/edit');
        }));

        it('should attach an Model to the controller scope', function () {
          expect($scope.vm.model._id).toBe(mockModel._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/models/client/views/form-model.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });*/
})();
