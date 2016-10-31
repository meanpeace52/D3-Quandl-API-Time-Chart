(function () {
  'use strict';
  angular.module('models')
      .run(menuConfig)
      .constant('modelOptions', {
        access: ['public','private','for sale']
      });

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items

  }
})();
