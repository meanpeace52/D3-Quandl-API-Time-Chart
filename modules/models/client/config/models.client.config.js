(function () {
  'use strict';
  angular.module('models').run(menuConfig);
  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Models',
      state: 'models.list',
      roles: ['user']
    });
    /*
        // Add the dropdown list item
        Menus.addSubMenuItem('topbar', 'models', {
          title: 'List Models',
          state: 'models.list'
        });

        // Add the dropdown create item
        Menus.addSubMenuItem('topbar', 'models', {
          title: 'Create Model',
          state: 'models.create',
          roles: ['user']
        });
    */
  }
})();
