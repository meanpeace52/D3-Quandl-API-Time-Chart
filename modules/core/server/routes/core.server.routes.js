'use strict';

module.exports = function (app) {
    // Root routing
    var core = require('../controllers/core.server.controller'),
        corePolicy = require('../policies/core.server.policy.js');

    // Define error pages
    app.route('/server-error').get(core.renderServerError);

    // Return a 404 for all undefined api, module or lib routes
    app.route('/:url(api|modules|lib|locales)/*').get(core.renderNotFound);

    app.route('/api/sign-upload-url').all(corePolicy.isAllowed)
        .post(core.signUploadUrl);

    // Define application route
    app.route('/*').get(core.renderIndex);
};
