'use strict';

/**
 * Module dependencies.
 */

var processPolicy = require('../policies/process.server.policy'),
    process = require('../controllers/process.server.controller');

module.exports = function (app) {

    // process collection routes
    app.route('/api/process').all(processPolicy.isAllowed)
        .get(process.list)
        .post(process.create);

    app.route('/api/process/:processId').all(processPolicy.isAllowed)
        .get(process.read)
        .put(process.update)
        .delete(process.delete);

    app.route('/api/process/user/:userId').all(processPolicy.isAllowed)
        .get(process.listByUserId);

};
