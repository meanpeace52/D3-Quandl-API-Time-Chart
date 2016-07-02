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

    app.route('/api/models/:modelId').all(modelPolicy.isAllowed)
        .get(model.read)
        .put(model.update)
        .delete(model.delete);

    app.route('/api/models/user/:userId').all(modelPolicy.isAllowed)
        .get(model.listByUserId);

};
