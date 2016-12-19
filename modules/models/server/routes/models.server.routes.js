'use strict';

/**
 * Module dependencies.
 */

var modelPolicy = require('../policies/models.server.policy'),
    model = require('../controllers/models.server.controller');

module.exports = function (app) {

    // model collection routes
    app.route('/api/models').all(modelPolicy.isAllowed)
        .get(model.list)
        .post(model.create);

    app.route('/api/models/search').all(modelPolicy.isAllowed)
        .get(model.searchModel);

    app.route('/api/models/copy')
        .post(model.copymodel);

    app.route('/api/models/purchasemodel/:id').all(modelPolicy.isAllowed)
        .post(model.purchaseModel);

    app.route('/api/models/validate-title').all(modelPolicy.isAllowed)
        .post(model.validateTitle);

    app.route('/api/models/user/:id').all(modelPolicy.isAllowed)
        .get(model.listByUserId);

    app.route('/api/models/dataset/:id').all(modelPolicy.isAllowed)
        .get(model.getModelByDataset);

    app.route('/api/models/:modelId').all(modelPolicy.isAllowed)
        .get(model.read)
        .put(model.update)
        .delete(model.delete);

};
