'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    later = require('later'),
    companiesService = require('../services/companies.server.services');

/**
 * Companies module init function.
 */
module.exports = function (app, db) {

  // Reload companies db everyday at 11PM.
  var scheduledReloadCompanies = later
      .parse
      .recur()
      .on(23)
      .hour();

  later.setInterval(companiesService.reloadCompanies, scheduledReloadCompanies);
};
