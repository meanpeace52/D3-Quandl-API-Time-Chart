'use strict';

/**
 * Module dependencies.
 */



var datasetsPolicy = require('../policies/datasets.server.policy'),
    datasets = require('../controllers/datasets.server.controller'),
    multer = require('multer'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path');

function checkDirectorySync(directory) {
    try {
        fs.statSync(directory);
    } catch(e) {
        mkdirp.sync(directory);
    }
}

function mkdirParent(dirPath, mode, callback) {
    //Call the standard fs.mkdir
    fs.mkdir(dirPath, mode, function(error) {
        //When it fail in this way, do the custom steps
        if (error && error.errno === 34) {
            //Create all the parents recursively
            mkdirParent(path.dirname(dirPath), mode, callback);
            //And then the directory
            mkdirParent(dirPath, mode, callback);
        }
        //Manually run the callback since we used our own callback to do all these
        //callback && callback(error);
        callback(error);
    });
}

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        mkdirp.sync(path.resolve('./')+'/s3-cache/datasets/'+req.user.username);
        cb(null, 's3-cache/datasets/'+req.user.username);
    }
}),
    upload = multer({
        storage : storage
    });

module.exports = function (app) {

    // datasets collection routes
    app.route('/api/datasets').all(datasetsPolicy.isAllowed)
        .get(datasets.list)
        .post(datasets.create);

    app.route('/api/datasets/upload')
        .post(upload.single('file'), datasets.uploadFile);

    app.route('/api/datasets/copy')
        .post(datasets.copydataset);

    app.route('/api/datasets/insert').all(datasetsPolicy.isAllowed)
        .post(datasets.insert);

    app.route('/api/datasets/json2csvinsert').all(datasetsPolicy.isAllowed)
        .post(datasets.json2csvInsert);

    app.route('/api/datasets/search').all(datasetsPolicy.isAllowed)
        .get(datasets.searchDataset);

    app.route('/api/datasets/validate-title').all(datasetsPolicy.isAllowed)
        .post(datasets.validateTitle);

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
