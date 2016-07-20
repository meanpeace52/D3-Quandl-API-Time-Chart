'use strict';

describe('Models E2E Tests:', function () {
  describe('Test Models page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/models');
      expect(element.all(by.repeater('model in models')).count()).toEqual(0);
    });
  });
});
