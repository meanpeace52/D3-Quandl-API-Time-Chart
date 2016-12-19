'use strict';

var Promise = require('bluebird'),
    s3 = require('s3'),
    csv = require('csv-to-json'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    config = require(path.resolve('./config/config')),
    _ = require('lodash'),
    json2csv = require('json2csv'),
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
            resolve(true);
        });
    });
}

function saveFileToS3(filePath){
    return new Promise(function(resolve, reject) {
        var params = {
            localFile: './s3-cache/' + filePath,
            s3Params: {
                Bucket: 'datasetstl',
                Key: filePath
            }
        };
        var uploader = client.uploadFile(params);
        uploader.on('error', function (err) {
            console.error('unable to upload:', err.stack);
            reject(err);
        });
        uploader.on('progress', function () {
            console.log('progress', uploader.progressMd5Amount,
                uploader.progressAmount, uploader.progressTotal);
        });
        uploader.on('end', function () {
            console.log('done uploading');
            resolve(true);
        });
    });
}

function csvToJson(file, hasheader) {
    return new Promise(function (resolve, reject) {
        csv.parse({ filename: file }, function (err, content) {
            if (err) {
                console.log('csv parse error', err);
                return reject(err);
            }

            if (!hasheader && content.length){
                var newRow = {};
                _.forOwn(content[0], function(value, key) {
                    newRow[key] = key;
                });
                content.unshift(newRow);
            }
            resolve(content);
        });   
    });
}

function copyDatasetFile(username, s3reference){
    return new Promise(function (resolve, reject) {
        var ref = s3reference.split('https://s3.amazonaws.com/')[1].split('/'), // 'https://s3.amazonaws.com/datasetstl/fed/D/S/DSWP10.csv'
            bucket = ref[0];

        ref.shift();
        var bucketFile = ref.join('/'),
            localBucketFile = getS3LocalPath(bucketFile),
            filename = (new Date().getTime()).toString(16),
        //https://s3.amazonaws.com/datasetstl/
            filekey = 'datasets/' + username + '/' + filename + '.csv',
            filepath = path.resolve('./') + '/s3-cache/' + filekey;

        mkdirp.sync(path.resolve('./')+'/s3-cache/datasets/' + username + '/');

        // Download file
        try {
            fs.accessSync(localBucketFile)
                .then(function () {
                    console.log(localBucketFile);
                    fs.writeFileSync(filepath, fs.readFileSync(path.resolve('./') + '/s3-cache/' + localBucketFile.replace('./s3-cache', '')));
                    saveFileToS3(filekey)
                        .then(function () {
                            resolve(filekey);
                        })
                        .catch(function(err) {
                            console.log(err);
                            reject(err);
                        });
                })
                .catch(function(err) {
                    console.log(err);
                    reject(err);
                });
        } catch (e) {
            getFileFromS3(bucket, bucketFile)
                .then(function () {
                    fs.writeFileSync(filepath, fs.readFileSync(path.resolve('./') + '/s3-cache/' + localBucketFile.replace('./s3-cache', '')));
                    saveFileToS3(filekey)
                        .then(function () {
                            resolve(filekey);
                        })
                        .catch(function(err) {
                            console.log(err);
                            reject(err);
                        });
                })
                .catch(function(err) {
                    console.log(err);
                    reject(err);
                });
        }
    });
}

function readWithS3(s3reference, hasheader) {
    var ref = s3reference.split('https://s3.amazonaws.com/')[1].split('/'), // 'https://s3.amazonaws.com/datasetstl/fed/D/S/DSWP10.csv'
        bucket = ref[0];

    ref.shift();
    var bucketFile = ref.join('/'),
        localBucketFile = getS3LocalPath(bucketFile);
        console.log(ref);
    return new Promise(function (resolve, reject) {
        try {
            fs.accessSync(localBucketFile);
            csvToJson(localBucketFile, hasheader)
                .then(formatDataIntoTable)
                .then(resolve)
                .catch(reject);
        } catch (e) {
            getFileFromS3(bucket, bucketFile)
                .then(csvToJson.bind(this, localBucketFile, hasheader))
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
    copyDatasetFile: copyDatasetFile,
    readWithS3: readWithS3,
    saveFileToS3: saveFileToS3
};
