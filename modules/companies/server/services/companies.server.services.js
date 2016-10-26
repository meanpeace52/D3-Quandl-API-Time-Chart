'use strict';

var Promise = require('bluebird'),
    _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Company = mongoose.model('Company'),
    quandlService = require(path.resolve('./modules/quandl/server/services/quandl.server.api')),
    config = require(path.resolve('./config/config'));

function loadCompanies(page){
    quandlService.getWikiCompanyList(config.quandlApiKey, page)
        .then(function(companies){
            console.log(companies);
            if (companies.length > 0){
                page++;
                Company.collection.insert(companies, function(err){
                    if (err){
                        console.log(err);
                    }
                    else{
                        return loadCompanies(page);
                    }
                });

            }
        })
        .catch(function(err){
            console.log(err);
        });
}

function reloadCompanies(){
    Company.remove({}, function(err, result){
        if (err){
            console.log(err);
        }
        else{
            loadCompanies(1);
        }
    });
}

module.exports = {
    loadCompanies: loadCompanies,
    reloadCompanies: reloadCompanies
};
