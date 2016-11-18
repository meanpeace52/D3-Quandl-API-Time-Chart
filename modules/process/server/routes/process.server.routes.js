'use strict';

/**
 * Module dependencies.
 */

var processPolicy = require('../policies/process.server.policy'),
    process = require('../controllers/process.server.controller'),
    deployr = require('../controllers/deployr.server.controller');

module.exports = function (app) {

    // process collection routes
    app.route('/api/process').all(processPolicy.isAllowed)
        .get(process.list)
        .post(process.create);

    app.route('/api/process/user').all(processPolicy.isAllowed)
        .get(process.listByUserId);

    app.route('/api/process/:processId').all(processPolicy.isAllowed)
        .get(process.read)
        .put(process.update)
        .delete(process.delete);

    app.route('/api/deployr/run').all(processPolicy.isAllowed)
        .post(deployr.deployrRun);
};
