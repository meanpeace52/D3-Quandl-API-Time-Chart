'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    DatasetS3Service = require('../services/datasets.server.s3'),
    Dataset = mongoose.model('Dataset'),
    s3 = require('s3'),
    fs = require('fs'),
    json2csv = require('json2csv'),
    _ = require('lodash');


/**
 * List by username
 */
exports.listByUsername = function (req, res) {
    Dataset.find({ user: req.readUser._id }).limit(100).sort('-created').exec(function (err, datasets) {
        console.log(datasets);
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(datasets);
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
    var query = { title: new RegExp(req.query.q, 'i') };
    Dataset.find(query).sort('-created').limit(10).populate('user', 'displayName').exec(function (err, datasets) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(datasets);
        }
    });
};

/**
 * Create a dataset
 */

function saveDatasetCopy(user, entry, cb) {
    var dataset = new Dataset(_.omit(entry.toObject(), '_id'));
    dataset.user = user;
    console.log('inside save', dataset);
    dataset.save(cb);
}

function saveFileToS3(filePath, path) {

    var client = s3.createClient({
        maxAsyncS3: 20, 
        s3RetryCount: 3, 
        s3RetryDelay: 1000,
        multipartUploadThreshold: 20971520, 
        multipartUploadSize: 15728640, 
        s3Options: {
            accessKeyId: 'AKIAI356G25CALROLSGA',
            secretAccessKey: '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'
        }
    });

    var params = {
      localFile: "./s3-cache/" + filePath,
     
      s3Params: {
        Bucket: "datasetstl",
        Key: path+filePath,
      },
    };
    var uploader = client.uploadFile(params);
    uploader.on('error', function(err) {
      console.error("unable to upload:", err.stack);
    });
    uploader.on('progress', function() {
      console.log("progress", uploader.progressMd5Amount,
                uploader.progressAmount, uploader.progressTotal);
    });
    uploader.on('end', function() {
      console.log("done uploading");
    });

}

exports.create = function (req, res) {
    Dataset.findById(req.body._id).exec(function(err, entry) {
        if (err) {
            console.log('error retreiving the entry', err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        saveDatasetCopy(req.user, entry, function(err, result) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
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
    // var datasets = [

    //     {id: "572439a76c58ddc70358be8f", cols: ["DATE", "VALUEA", "VALUEB"], primary: "DATE"},
    //     {id: "57219ce88b59880e5d1dfe75", cols: ["DATE", "VALUE"], primary: "DATE"}
    // ];
    // req.body.datasets = datasets;
    // req.body.type = 1;

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

                    if(data.columns[splice_i] == req.body.datasets[0].cols[j]) flag = true;

                }

                if(flag == false) {

                    for (var r = 0; r < rows_count; r++) {

                        delete data.rows[r][data.columns[splice_i]];

                    }
                    data.columns.splice(splice_i, 1);

                } else {

                    path += '_'+i;
                    splice_i++;

                }

            }



            Dataset.findById(req.body.datasets[1].id, function (err, one2) {

                var p1_2 = one2.s3reference.split('/'),
                p2_2 = p1_2[7].split('.');
                path += '_'+p2_2[0];

                DatasetS3Service.readWithS3(one2.s3reference).then(function (data2) {

                    var columns_count = data2.columns.length,
                        rows_count = data2.rows.length,
                        splice_i = 0;

                    for (var i = 0; i < columns_count; i++) {

                        var params_count = req.body.datasets[1].cols.length,
                            flag = false;

                        for (var j = 0; j < params_count; j++) {

                            if(data2.columns[splice_i] == req.body.datasets[1].cols[j]) flag = true;

                        }

                        if(flag == false) {

                            for (var r = 0; r < rows_count; r++) {

                                delete data2.rows[r][data2.columns[splice_i]];

                            }
                            data2.columns.splice(splice_i, 1);

                        } else {

                            path += '_'+i;
                            splice_i++;

                        }

                    }

                    var data_len = data.rows.length,
                        data2_len = data2.rows.length,
                        col_len = data.columns.length,
                        col2_len = data2.columns.length;
                    var out = [],
                        columns = [];

                    if(req.body.type == 0 || req.body.type == 1) {

                        for (var i = 0; i < data_len; i++) {

                            var flag_left = false;

                            for (var j = 0; j < data2_len; j++) {

                                if(data.rows[i][req.body.datasets[0].primary] == data2.rows[j][req.body.datasets[1].primary]) {

                                    var pre_obj = {};
                                    flag_left = true;

                                    for (var i_col = 0; i_col < col_len; i_col++) {

                                        for (var j_col = 0; j_col < col2_len; j_col++) {


                                            if(data.columns[i_col] == req.body.datasets[0].primary && data2.columns[j_col] !== req.body.datasets[1].primary) {

                                                pre_obj[data.columns[i_col]] = data.rows[i][data.columns[i_col]];

                                            } else if(data2.columns[j_col] !== req.body.datasets[0].primary && data2.columns[j_col] !== req.body.datasets[1].primary) {

                                                pre_obj[data.columns[i_col]+'A'] = data.rows[i][data.columns[i_col]];
                                                pre_obj[data2.columns[j_col]+'B'] = data2.rows[j][data2.columns[j_col]];

                                            }

                                        }

                                    }

                                    out.push(pre_obj);

                                }

                                if(req.body.type == 0 && i == 0) {

                                    var flag_inner = false;

                                    for (var ii = 0; ii < data_len; ii++) {

                                        if(data.rows[ii][req.body.datasets[0].primary] == data2.rows[j][req.body.datasets[1].primary]) {
                                        
                                            flag_inner = true;

                                        }

                                    }

                                    if(flag_inner == false) {

                                        var pre_obj = {};

                                        for (var i_col = 0; i_col < col_len; i_col++) {

                                            for (var j_col = 0; j_col < col2_len; j_col++) {

                                                if(data2.columns[j_col] == req.body.datasets[0].primary && data.columns[i_col] !== req.body.datasets[1].primary) {

                                                    pre_obj[data2.columns[j_col]] = data2.rows[j][data2.columns[j_col]];

                                                } else if(data.columns[i_col] !== req.body.datasets[0].primary && data.columns[i_col] !== req.body.datasets[1].primary) {

                                                    pre_obj[data.columns[i_col]+'A'] = null;
                                                    pre_obj[data2.columns[j_col]+'B'] = data2.rows[j][data2.columns[j_col]];

                                                }

                                            }

                                        }

                                        out.push(pre_obj);

                                    }

                                }

                            }

                            if(flag_left == false) {

                                var pre_obj = {};

                                for (var i_col = 0; i_col < col_len; i_col++) {

                                    for (var j_col = 0; j_col < col2_len; j_col++) {

                                        if(data.columns[i_col] == req.body.datasets[0].primary && data2.columns[j_col] !== req.body.datasets[1].primary) {

                                            pre_obj[data.columns[i_col]] = data.rows[i][data.columns[i_col]];

                                        } else if(data2.columns[j_col] !== req.body.datasets[0].primary && data2.columns[j_col] !== req.body.datasets[1].primary) {

                                            pre_obj[data.columns[i_col]+'A'] = data.rows[i][data.columns[i_col]];
                                            pre_obj[data2.columns[j_col]+'B'] = null;

                                        }

                                    }

                                }

                                out.push(pre_obj);

                            }

                        }

                    }



                    for (var key in out[0]) {
                        columns.push(key);
                    }

                    out.sort(function(a, b) {
                        return (a[req.body.datasets[0].primary] > b[req.body.datasets[0].primary]) ? 1 : -1;
                    });

                    console.log(out);

                    json2csv({ data: out, fields: columns }, function(err, csv) {

                        fs.writeFileSync("./s3-cache/" + path + ".csv", csv);

                        saveFileToS3(path + ".csv", p1[4]+'/'+p1[5]+'/'+p1[6]+'/');

                        var dataset = new Dataset();
                        dataset.s3reference = "https://s3.amazonaws.com/datasetstl/"+p1[4]+'/'+p1[5]+'/'+p1[6]+'/'+path+".csv";
                        dataset.user = one.user;
                        dataset.title = one.title;
                        dataset.save(function (err) {

                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                res.json(dataset);
                            }

                        });

                    });


                });

            });


        });

    });

}

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

                    if(data.columns[splice_i] == req.body.columns[j]) flag = true;

                }

                if(flag == false) {

                    for (var r = 0; r < rows_count; r++) {

                        delete data.rows[r][data.columns[splice_i]];

                    }
                    data.columns.splice(splice_i, 1);

                } else {

                    splice_i++;
                    path += '_'+i;

                }

            }

            json2csv({ data: data.rows, fields: data.columns }, function(err, csv) {

                fs.writeFileSync("./s3-cache/" + path + ".csv", csv);

                saveFileToS3(path + ".csv", p1[4]+'/'+p1[5]+'/'+p1[6]+'/');

                var dataset = new Dataset();
                dataset.s3reference = "https://s3.amazonaws.com/datasetstl/"+p1[4]+'/'+p1[5]+'/'+p1[6]+'/'+path+".csv";
                dataset.user = one.user;
                dataset.title = one.title;
                dataset.save(function (err) {

                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.json(dataset);
                    }

                });

            });

        });

    });

};

/**
 * Update a dataset
 */
exports.update = function (req, res) {
    var dataset = req.dataset;

    dataset.title = req.body.title;
    dataset.content = req.body.content;

    Dataset.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(dataset);
        }
    });
};

/**
 * Delete an dataset
 */
exports.delete = function (req, res) {
    var dataset = req.dataset;

    Dataset.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
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
        } else {
            res.json(datasets);
        }
    });
};

exports.readWithS3 = function (req, res) {
    var dataset = req.dataset;

    DatasetS3Service.readWithS3(dataset.s3reference).then(function (data) {
        res.json(data);
    }).catch(function (err) {
        res.status(400).json({ error: 'error reading file' });
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
