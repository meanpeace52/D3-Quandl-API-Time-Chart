'use strict';

var Promise = require('bluebird'),
    s3 = require('s3'),
    csv = require('csv-to-json'),
    fs = require('fs'),
    _ = require('lodash');

function getS3LocalPath(filePath) {
    return './s3-cache/'+ filePath;
}

function getFileFromS3(bucket, filePath) {
    return new Promise(function(resolve, reject) {
        var client = s3.createClient({
            maxAsyncS3: 20,     // this is the default
            s3RetryCount: 3,    // this is the default
            s3RetryDelay: 1000, // this is the default
            multipartUploadThreshold: 20971520, // this is the default (20 MB)
            multipartUploadSize: 15728640, // this is the default (15 MB)
            s3Options: {
                accessKeyId: 'AKIAI356G25CALROLSGA',
                secretAccessKey: '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'
                // any other options are passed to new AWS.S3()
                // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
            }
        });

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
            resolve(true);
        });
    });
}

function csvToJson(file) {
    return new Promise(function (resolve, reject) {
        csv.parse({ filename: file }, function (err, content) {
            if (err) {
                console.log('csv parse error', err);
                return reject(err);
            }

            resolve(content);
        });   
    });
}

function readWithS3(s3reference) {
    var ref = s3reference.split('https://s3.amazonaws.com/')[1].split('/'), // 'https://s3.amazonaws.com/datasetstl/fed/D/S/DSWP10.csv'
        bucket = ref[0];

    ref.shift();
    var bucketFile = ref.join('/'),
        localBucketFile = getS3LocalPath(bucketFile);
        console.log(ref);
    return new Promise(function (resolve, reject) {
        try {
            fs.accessSync(localBucketFile);
            csvToJson(localBucketFile)
                .then(formatDataIntoTable)
                .then(resolve)
                .catch(reject);
        } catch (e) {
            getFileFromS3(bucket, bucketFile)
                .then(csvToJson.bind(this, localBucketFile))
                .then(formatDataIntoTable)
                .then(resolve)
                .catch(reject);
        }
    });
}

function formatDataIntoTable(data) {
    return {
        columns: _.keys(_.sample(data)),
        rows: data
    };
}

module.exports = {
    getS3LocalPath: getS3LocalPath,
    getFileFromS3: getFileFromS3,
    csvToJson: csvToJson,
    readWithS3: readWithS3
};