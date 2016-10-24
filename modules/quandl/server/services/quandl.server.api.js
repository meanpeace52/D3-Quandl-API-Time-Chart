'use strict';

var Promise = require('bluebird'),
    request = require('superagent'),
    _ = require('lodash');

function getAllDatasets(apikey, databasecode, itemsperpage, pageno){
    return new Promise(function(resolve, reject) {
        request
            .get('https://www.quandl.com/api/v3/datasets.json?database_code=' + databasecode + '&per_page=' + itemsperpage + '&sort_by=id&page=' + pageno + '&api_key=' + apikey)
            .set('Accept', 'application/json')
            .end(function(err, res){
                if (err){
                    console.log(err);
                    return reject(err);
                }
                else{
                    return resolve(res.body);
                }
            });
    });
}

function getDataset(apikey, databasecode, datasetcode){
    return new Promise(function(resolve, reject) {
        request
            .get('https://www.quandl.com/api/v3/datasets/' + databasecode + '/' + datasetcode + '.json?api_key=' + apikey)
            .set('Accept', 'application/json')
            .end(function(err, res){
                if (err){
                    console.log(err);
                    return reject(err);
                }
                else{
                    return resolve(res.body);
                }
            });
    });
}

function getWikiCompanyList(apikey, page){
    // 100 per page is the maximum
    return new Promise(function(resolve, reject) {
        request
            .get('https://www.quandl.com/api/v3/datasets.json?database_code=WIKI&per_page=100&sort_by=id&page=' + page + '&api_key=' + apikey)
            .set('Accept', 'application/json')
            .end(function(err, res){
                if (err){
                    console.log(err);
                    return reject(err);
                }
                else{
                    var companies = _.map(res.body.datasets, function(dataset){
                        return { code : dataset.dataset_code, name : dataset.name.replace(' Prices, Dividends, Splits and Trading Volume', '') };
                    });
                    return resolve(companies);
                }
            });
    });
}

module.exports = {
    getAllDatasets: getAllDatasets,
    getDataset: getDataset,
    getWikiCompanyList: getWikiCompanyList
};
