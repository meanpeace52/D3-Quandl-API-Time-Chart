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
  // Check if test is running as this code keeps Mocha from finishing to execute
  var isInTest = typeof global.it === 'function';

  if(!isInTest){
      var scheduledReloadCompanies = later
          .parse
          .recur()
          .on(23)
          .hour();

      later.setInterval(companiesService.reloadCompanies, scheduledReloadCompanies);
  }

};
