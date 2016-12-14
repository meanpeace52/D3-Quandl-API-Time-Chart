'use strict';

/**
 * Module dependencies
 */
var companiesPolicy = require('../policies/companies.server.policy'),
    companies = require('../controllers/companies.server.controller'),
    companiesService = require('../services/companies.server.services');

module.exports = function(app) {
  // Companies Routes
  app.route('/api/companies').all(companiesPolicy.isAllowed)
    .get(companies.list)
    .post(companies.create);


  app.route('/api/companies/loadCompanies').all(companiesPolicy.isAllowed)
      .get(function(req, res){
        companiesService.loadCompanies(1);
        res.send({ success : true });
      });

  app.route('/api/companies/search/:query').all(companiesPolicy.isAllowed)
      .get(companies.search);

  app.route('/api/companies/search-statements/:query').all(companiesPolicy.isAllowed)
      .get(companies.searchStatements);

  app.route('/api/companies/search-statements-by-ticker/:ticker').all(companiesPolicy.isAllowed)
      .get(companies.searchStatementsByTicker);

  app.route('/api/companies/findbycode/:id').all(companiesPolicy.isAllowed)
      .get(companies.findByCode);

  app.route('/api/companies/statement').all(companiesPolicy.isAllowed)
      .post(companies.getStatement);

  app.route('/api/companies/:companyId').all(companiesPolicy.isAllowed)
    .get(companies.read)
    .put(companies.update)
    .delete(companies.delete);

  // Finish by binding the Company middleware
  app.param('companyId', companies.companyByID);
};
