'use strict';

/**
 * Module dependencies
 */
var modelsPolicy = require('../policies/models.server.policy'),
  models = require('../controllers/models.server.controller');

module.exports = function(app) {
  // Models Routes
  app.route('/api/models').all(modelsPolicy.isAllowed)
    .get(models.list)
    .post(models.create);

  app.route('/api/models/:modelId').all(modelsPolicy.isAllowed)
    .get(models.read)
    .put(models.update)
    .delete(models.delete);

  // Finish by binding the Model middleware
  app.param('modelId', models.modelByID);
};
