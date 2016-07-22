'use strict';

/**
 * Module dependencies.
 */

var datasetsPolicy = require('../policies/datasets.server.policy'),
    datasets = require('../controllers/datasets.server.controller');

module.exports = function (app) {

    // datasets collection routes
    app.route('/api/datasets').all(datasetsPolicy.isAllowed)
        .get(datasets.list)
        .post(datasets.create);

    app.route('/api/datasets/search').all(datasetsPolicy.isAllowed)
        .get(datasets.searchDataset);

    app.route('/api/datasets/saveCustom').all(datasetsPolicy.isAllowed)
        .post(datasets.saveCustom);

    app.route('/api/datasets/merge').all(datasetsPolicy.isAllowed)
        .post(datasets.merge);

    // Single post routes
    app.route('/api/datasets/:datasetId').all(datasetsPolicy.isAllowed)
        .get(datasets.read)
        .put(datasets.update)
        .delete(datasets.delete);


    app.route('/api/datasets/user/:username').all(datasetsPolicy.isAllowed)
        .get(datasets.listByUsername);

    app.route('/api/datasets/:datasetId/withs3').all(datasetsPolicy.isAllowed)
        .get(datasets.readWithS3);


    // Finish by binding the post middleware
    app.param('datasetId', datasets.datasetByID);
};
