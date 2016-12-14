'use strict';

var Promise = require('bluebird'),
    _ = require('lodash'),
    fs = require('fs'),
    s3 = require('s3'),
    path = require('path'),
    mongoose = require('mongoose'),
    Company = mongoose.model('Company'),
    quandlService = require(path.resolve('./modules/quandl/server/services/quandl.server.api')),
    config = require(path.resolve('./config/config')),
    client = s3.createClient({
        maxAsyncS3: 20,     // this is the default
        s3RetryCount: 3,    // this is the default
        s3RetryDelay: 1000, // this is the default
        multipartUploadThreshold: 20971520, // this is the default (20 MB)
        multipartUploadSize: 15728640, // this is the default (15 MB)
        s3Options: {
            accessKeyId: config.s3AccessKeyId,
            secretAccessKey: config.s3SecretAccessKey
            // any other options are passed to new AWS.S3()
            // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
        }
    });

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

function getS3LocalPath(filePath) {
    return './s3-cache/'+ filePath;
}

function getFileFromS3(bucket, filePath) {
    return new Promise(function(resolve, reject) {
        var params = {
            localFile: getS3LocalPath(filePath),

            s3Params: {
                Bucket: bucket,
                Key: filePath
                // other options supported by getObject
                // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
            }
        };

        var downloader = client.downloadFile(params);
        downloader.on('error', function (err) { // error to client
            console.error('unable to download:', err.stack);
            reject(err);
        });
        downloader.on('progress', function () {
            console.log('progress', downloader.progressAmount, downloader.progressTotal);
        });
        downloader.on('end', function () {
            console.log('done downloading');
            fs.readFile(params.localFile, 'utf8', function (err, data) {
                if (err){
                    return reject(err);
                }
                return resolve(JSON.parse(data));
            });

        });
    });
}

module.exports = {
    loadCompanies: loadCompanies,
    reloadCompanies: reloadCompanies,
    getFileFromS3: getFileFromS3
};
