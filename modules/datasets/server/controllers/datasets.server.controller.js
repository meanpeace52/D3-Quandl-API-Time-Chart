'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    DatasetS3Service = require('../services/datasets.server.s3'),
    Dataset = mongoose.model('Dataset'),
    config = require(path.resolve('./config/config')),
    s3 = require('s3'),
    fs = require('fs'),
    json2csv = require('json2csv'),
    _ = require('lodash'),
    User = mongoose.model('User'),
    client = s3.createClient({
        maxAsyncS3: 20, // this is the default
        s3RetryCount: 3, // this is the default
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


/**
 * List by username
 */
exports.listByUsername = function (req, res) {
    User.findOne({username: req.params.username}, function (err, user) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            Dataset.find({
                user: user._id
            }).limit(100).sort('-created').exec(function (err, datasets) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                else {
                    res.jsonp(datasets);
                }
            });
        }
    });
};

/**
 * Search Dataset by the query.
 *
 * @param req
 * @param res
 */
exports.searchDataset = function (req, res) {
    var query = {
        title: new RegExp(req.query.q, 'i'),
        //access: { $in : [ 'public', 'paid' ]}
    };
    Dataset.find(query).sort('-created').limit(10).populate('user', 'username').exec(function (err, datasets) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.jsonp(datasets);
        }
    });
};

/**
 * Create a dataset
 */

function saveDatasetCopy(user, entry, cb) {
    if (entry.user && user._id === entry.user._id){
        throw new Error('You can not copy your own dataset.');
    }

    DatasetS3Service.copyDatasetFile(user.username, entry.s3reference)
        .then(function(path){
            var dataset = new Dataset(_.omit(entry.toObject(), '_id'));
            dataset.user = user;
            dataset.created = new Date();
            dataset.origDataset = entry._id;
            dataset.s3reference = 'https://s3.amazonaws.com/datasetstl/' + path;
            console.log('inside save', dataset);
            dataset.save(cb);
        })
        .catch(function(err){
            throw new Error(err);
        });
}

function saveFileToS3(filePath, path, done) {

    var params = {
        localFile: './s3-cache/' + filePath,

        s3Params: {
            Bucket: 'datasetstl',
            Key: path + filePath,
        },
    };
    var uploader = client.uploadFile(params);
    uploader.on('error', function (err) {
        console.error('unable to upload:', err.stack);
    });
    uploader.on('progress', function () {
        console.log('progress', uploader.progressMd5Amount,
            uploader.progressAmount, uploader.progressTotal);
    });
    uploader.on('end', function () {
        if (typeof done === 'function') done();
        console.log('done uploading');
    });
}

exports.create = function (req, res) {
    var dataset = new Dataset(req.body);
    dataset.user = req.user._id;
    dataset.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.json(dataset);
        }
    });
};

exports.copydataset = function (req, res) {
    Dataset.findById(req.body._id).exec(function (err, dataset) {
        if (err) {
            console.log('error retreiving the entry', err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        saveDatasetCopy(req.user, dataset, function (err, result) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                res.json(result);
            }
        });
    });
};

/**
 * Show the current dataset
 */
exports.read = function (req, res) {
    res.json(req.dataset);
};

/**
 * Merge darasets
 */
exports.merge = function (req, res) {

    Dataset.findById(req.body.datasets[0].id, function (err, one) {

        var p1 = one.s3reference.split('/'),
            p2 = p1[7].split('.'),
            path = p2[0];

        DatasetS3Service.readWithS3(one.s3reference).then(function (data) {

            var columns_count = data.columns.length,
                rows_count = data.rows.length,
                splice_i = 0;

            for (var i = 0; i < columns_count; i++) {

                var params_count = req.body.datasets[0].cols.length,
                    flag = false;

                for (var j = 0; j < params_count; j++) {

                    if (data.columns[splice_i] == req.body.datasets[0].cols[j]) flag = true;

                }

                if (flag === false) {

                    for (var r = 0; r < rows_count; r++) {

                        delete data.rows[r][data.columns[splice_i]];

                    }
                    data.columns.splice(splice_i, 1);

                }
                else {

                    path += '_' + i;
                    splice_i++;

                }

            }



            Dataset.findById(req.body.datasets[1].id, function (err, one2) {

                var p1_2 = one2.s3reference.split('/'),
                    p2_2 = p1_2[7].split('.');
                path += '_' + p2_2[0];

                DatasetS3Service.readWithS3(one2.s3reference).then(function (data2) {

                    var columns_count = data2.columns.length,
                        rows_count = data2.rows.length,
                        splice_i = 0;

                    for (var i2 = 0; i2 < columns_count; i2++) {

                        var params_count = req.body.datasets[1].cols.length,
                            flag = false;

                        for (var j = 0; j < params_count; j++) {

                            if (data2.columns[splice_i] == req.body.datasets[1].cols[j]) flag = true;

                        }

                        if (flag === false) {

                            for (var r = 0; r < rows_count; r++) {

                                delete data2.rows[r][data2.columns[splice_i]];

                            }
                            data2.columns.splice(splice_i, 1);

                        }
                        else {

                            path += '_' + i2;
                            splice_i++;

                        }

                    }

                    var data_len = data.rows.length,
                        data2_len = data2.rows.length,
                        col_len = data.columns.length,
                        col2_len = data2.columns.length;
                    var out = [],
                        columns = [];

                    if (req.body.params.type === 0 || req.body.params.type === 1) {

                        for (var k = 0; k < data_len; k++) {

                            var flag_left = false;

                            for (var l = 0; l < data2_len; l++) {

                                if (data.rows[k][req.body.datasets[0].primary] == data2.rows[l][req.body.datasets[1].primary]) {

                                    var pre_obj1 = {};
                                    flag_left = true;

                                    for (var i1_col = 0; i1_col < col_len; i1_col++) {

                                        for (var j1_col = 0; j1_col < col2_len; j1_col++) {


                                            if (data.columns[i1_col] == req.body.datasets[0].primary && data2.columns[j1_col] !== req.body.datasets[1].primary) {

                                                pre_obj1[data.columns[i1_col]] = data.rows[k][data.columns[i1_col]];

                                            }
                                            else if (data2.columns[j1_col] !== req.body.datasets[0].primary && data2.columns[j1_col] !== req.body.datasets[1].primary) {

                                                pre_obj1[data.columns[i1_col] + 'A'] = data.rows[k][data.columns[i1_col]];
                                                pre_obj1[data2.columns[j1_col] + 'B'] = data2.rows[l][data2.columns[j1_col]];

                                            }

                                        }

                                    }

                                    out.push(pre_obj1);

                                }

                                if (req.body.params.type === 0 && k === 0) {

                                    var flag_inner = false;

                                    for (var ii = 0; ii < data_len; ii++) {

                                        if (data.rows[ii][req.body.datasets[0].primary] == data2.rows[l][req.body.datasets[1].primary]) {

                                            flag_inner = true;

                                        }

                                    }

                                    if (flag_inner === false) {

                                        var pre_obj2 = {};

                                        for (var i2_col = 0; i2_col < col_len; i2_col++) {

                                            for (var j2_col = 0; j2_col < col2_len; j2_col++) {

                                                if (data2.columns[j2_col] == req.body.datasets[0].primary && data.columns[i2_col] !== req.body.datasets[1].primary) {

                                                    pre_obj2[data2.columns[j2_col]] = data2.rows[l][data2.columns[j2_col]];

                                                }
                                                else if (data.columns[i2_col] !== req.body.datasets[0].primary && data.columns[i2_col] !== req.body.datasets[1].primary) {

                                                    pre_obj2[data.columns[i2_col] + 'A'] = null;
                                                    pre_obj2[data2.columns[j2_col] + 'B'] = data2.rows[l][data2.columns[j2_col]];

                                                }

                                            }

                                        }

                                        out.push(pre_obj2);

                                    }

                                }

                            }

                            if (flag_left === false) {

                                var pre_obj3 = {};

                                for (var i3_col = 0; i3_col < col_len; i3_col++) {

                                    for (var j3_col = 0; j3_col < col2_len; j3_col++) {

                                        if (data.columns[i3_col] == req.body.datasets[0].primary && data2.columns[j3_col] !== req.body.datasets[1].primary) {

                                            pre_obj3[data.columns[i3_col]] = data.rows[k][data.columns[i3_col]];

                                        }
                                        else if (data2.columns[j3_col] !== req.body.datasets[0].primary && data2.columns[j3_col] !== req.body.datasets[1].primary) {

                                            pre_obj3[data.columns[i3_col] + 'A'] = data.rows[k][data.columns[i3_col]];
                                            pre_obj3[data2.columns[j3_col] + 'B'] = null;

                                        }

                                    }

                                }

                                out.push(pre_obj3);

                            }

                        }

                    }



                    for (var key in out[0]) {
                        columns.push(key);
                    }

                    out.sort(function (a, b) {
                        return (a[req.body.datasets[0].primary] > b[req.body.datasets[0].primary]) ? 1 : -1;
                    });

                    out.splice(0, 1);

                    if (req.body.params.action == 'show') {

                        res.json({
                            rows: out,
                            columns: columns
                        });

                    }
                    else if (req.body.params.action == 'insert') {

                        json2csv({
                            data: out,
                            fields: columns
                        }, function (err, csv) {

                            csv = csv.replace(/"/ig, '');
                            var name = (new Date().getTime()).toString(16);
                            fs.writeFileSync('./s3-cache/' + name + '.csv', csv);

                            saveFileToS3(name + '.csv', p1[4] + '/' + p1[5] + '/' + p1[6] + '/');
                            var dataset = new Dataset();
                            dataset.s3reference = 'https://s3.amazonaws.com/datasetstl/' + p1[4] + '/' + p1[5] + '/' + p1[6] + '/' + name + '.csv';
                            dataset.user = one.user;
                            dataset.title = req.body.params.title;
                            dataset.notice = req.body.params.notice;
                            dataset.save(function (err) {

                                if (err) {
                                    return res.status(400).send({
                                        message: errorHandler.getErrorMessage(err)
                                    });
                                }
                                else {
                                    res.json(dataset);
                                }

                            });

                        });

                    }


                });

            });


        });

    });

};

/**
 * Save custom dataset
 */
exports.saveCustom = function (req, res) {


    Dataset.findById(req.body.id, function (err, one) {

        var p1 = one.s3reference.split('/'),
            p2 = p1[7].split('.'),
            path = p2[0];


        DatasetS3Service.readWithS3(one.s3reference).then(function (data) {

            var columns_count = data.columns.length,
                rows_count = data.rows.length,
                splice_i = 0;

            for (var i = 0; i < columns_count; i++) {

                var params_count = req.body.columns.length,
                    flag = false;

                for (var j = 0; j < params_count; j++) {

                    if (data.columns[splice_i] == req.body.columns[j]) flag = true;

                }

                if (flag === false) {

                    for (var r = 0; r < rows_count; r++) {

                        delete data.rows[r][data.columns[splice_i]];

                    }
                    data.columns.splice(splice_i, 1);

                }
                else {

                    splice_i++;
                    path += '_' + i;

                }

            }

            data.rows.splice(0, 1);

            if (req.body.action == 'show') {

                res.json({
                    rows: data.rows,
                    columns: data.columns
                });

            }
            else if (req.body.action == 'insert') {

                json2csv({
                    data: data.rows,
                    fields: data.columns
                }, function (err, csv) {

                    csv = csv.replace(/"/ig, '');

                    fs.writeFileSync('./s3-cache/' + path + '.csv', csv);

                    saveFileToS3(path + '.csv', p1[4] + '/' + p1[5] + '/' + p1[6] + '/');

                    var dataset = new Dataset();
                    dataset.s3reference = 'https://s3.amazonaws.com/datasetstl/' + p1[4] + '/' + p1[5] + '/' + p1[6] + '/' + path + '.csv';
                    dataset.user = one.user;
                    dataset.title = req.body.title;
                    dataset.notice = req.body.notice;
                    dataset.save(function (err) {

                        if (err) {
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        }
                        else {
                            res.json(dataset);
                        }

                    });

                });

            }

        });

    });

};

/**
 * Update a dataset
 */
exports.update = function (req, res) {
    Dataset.findOneAndUpdate({ _id : req.body._id }, req.body, function(err, doc){
        if (err){
            res.status(err.status).json(err);
        }
        else{
            res.json(doc);
        }
    });
};

/**
 * Delete an dataset
 */
exports.delete = function (req, res) {
    var dataset = req.dataset;

    dataset.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.json(dataset);
        }
    });
};

/**
 * List of datasets
 */
exports.list = function (req, res) {
    Dataset.find().sort('-created').populate('user', 'displayName').exec(function (err, datasets) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.json(datasets);
        }
    });
};

exports.readWithS3 = function (req, res) {
    var dataset = req.dataset;

    DatasetS3Service.readWithS3(dataset.s3reference).then(function (data) {
        res.json(data);
    }).catch(function (err) {
        res.status(400).json({
            error: 'error reading file'
        });
    });
};

exports.datasetByID = function (req, res, next, id) {
    Dataset.findById(id).populate('user', 'displayName').exec(function (err, dataset) {
        if (err) {
            return next(err);
        }
        if (!dataset) {
            return next(new Error('Failed to load Dataset ' + id));
        }
        req.dataset = dataset;
        next();
    });
};

exports.insert = function (req, res) {
    var selectedDataset = req.body.selectedDataset,
        p1 = selectedDataset.s3reference.split('/'),
        path = (new Date().getTime()).toString(16);

    json2csv({
        data: req.body.rows,
        fields: req.body.columns
    }, function (err, csv) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        fs.writeFileSync('./s3-cache/' + path + '.csv', csv);
        saveFileToS3(path + '.csv', p1[4] + '/' + p1[5] + '/' + p1[6] + '/', function () {
            var dataset = new Dataset();
            dataset.s3reference = 'https://s3.amazonaws.com/datasetstl/' + p1[4] + '/' + p1[5] + '/' + p1[6] + '/' + path + '.csv';
            dataset.title = req.body.title;
            dataset.user = req.user._id;
            dataset.save(function (err, dataset) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                return res.status(201).json(dataset);
            });
        });
    });
};

exports.uploadFile = function (req, res) {
    var uploader = client.uploadFile({
        localFile: req.file.path,
        s3Params: {
            ContentType: req.file.mimetype,
            Bucket: 'datasetstl',
            Key: req.user.username + '/' + req.file.filename + '.csv'
        }
    });

    uploader.on('error', function (err) {
        res.status(500).send({
            message: errorHandler.getErrorMessage(err)
        });
        fs.unlink(req.file.path);
    });

    uploader.on('end', function (file) {
        var fileData = {
            name: req.file.originalname,
            _id: 'https://s3.amazonaws.com/datasetstl/' + req.user.username + '/' + req.file.filename + '.csv'
        };

        res.json(fileData);
        fs.unlink(req.file.path);
    });
};
