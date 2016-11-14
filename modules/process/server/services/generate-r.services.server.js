function RCodeGenerator(){
    'use strict';

    var deployr = require('deployr'),
        Promise = require('bluebird');

    this.code = 'require(deployrUtils)\n';

    this.setS3Configuration = function(s3accessKey, s3secretKey, s3bucket){
        this.code += 'library("aws.s3")\n';

        this.code += 'accessKey <- "' + s3accessKey + '"\n';
        this.code += 'secretKey <- "' + s3secretKey + '"\n';
        this.code += 'bucketName <- "' + s3bucket + '"\n';

        this.code += 'Sys.setenv("AWS_ACCESS_KEY_ID" = accessKey,\n';
        this.code += '           "AWS_SECRET_ACCESS_KEY" = secretKey)\n';

        this.s3configured = true;

        return this;
    };

    this.loads3File = function(s3filekey, s3filevar){
        if (!this.s3configured){
            throw new Error('You need to call setS3Configuration before you can run this function. RCodeGenerator.loads3File()');
        }

        this.code += 'getcsv <- function(fileName) {\n';
        this.code += '    baseName <- tail(unlist(strsplit(fileName, "/")), n=1)\n';
        this.code += '    tmpFile <- paste("/tmp", baseName, sep="/")\n';
        this.code += '    savedFile <- save_object(fileName, file=tmpFile, bucket=bucketName)\n';
        this.code += '    return(savedFile)\n';
        this.code += '}\n';

        this.code += s3filevar + ' <- getcsv("' + s3filekey + '")\n';

        return this;
    };

    this.loadCsvFile = function(inputFile, csvvar){
        this.code += csvvar + ' <- read.csv(' + inputFile + ')\n';
        return this;
    };

    this.printLMFit = function(inputData, yColIndex){
        this.code += 'colnames(' + inputData + ')[' + yColIndex + ']<-"depvar"\n';
        this.code += 'lm.fit<- lm(depvar~.,data=' + inputData + ')\n';
        this.code += 'print(summary(lm.fit))\n';
        return this;
    };

    this.linearRegression = function(s3accessKey, s3secretKey, s3bucket, inputData, yColIndex){
        this.setS3Configuration(s3accessKey, s3secretKey, s3bucket)
            .loads3File(inputData, 'csvfile')
            .loadCsvFile('csvfile', 'dataset')
            .printLMFit('dataset', yColIndex);
        return this;
    };

    this.execute = function(host, username, password){
        var self = this;
        return new Promise(function(resolve, reject){
            var project = null;
            deployr.configure({ host: host });

            var ruser = deployr.io('/r/user/login')
                .data({ username: username , password: password })
                .error(function(err) {
                    console.log(err);
                    return reject({
                        err : err,
                        extra : 'User Login'
                    });
                })
                .end()
                .io('/r/project/create')
                .error(function(err) {
                    console.log(err);
                    return reject({
                        err : err,
                        extra : 'Project Create'
                    });
                })
                .end(function(res) {
                    project = res.get('project').project;
                    return { project: project };
                })
                .io('/r/project/execute/code')
                .data({ code: self.code, echooff : true })
                .error(function(err) {
                    console.log(err);
                    return reject({
                        err : err,
                        extra : 'Execute Code'
                    });
                })
                .end(function(res) {
                    var exec = res.get('execution').execution;
                    console.log('AuthProjectExecuteCode: R code execution completed, ' +
                        'rProjectExecution=' + exec);
                    /*
                     * Retrieve script execution results.
                     */
                    var rconsole = res.get('console');
                    console.log(rconsole);
                    var plots = res.get('results');
                    console.log(plots);
                    var files = res.get('artifacts');
                    console.log(files);
                    var objects = res.workspace(); // --or-- res.get('workspace').objects;
                    console.log(objects);

                    return resolve({
                        success : true,
                        execution : exec,
                        console : rconsole,
                        plots : plots,
                        files : files,
                        objects : objects
                    });
                })
                .ensure(function() {
                    ruser.release([project]);
                });
        });

    };

    if (this instanceof RCodeGenerator) {
        return this.RCodeGenerator;
    } else {
        return new RCodeGenerator();
    }
}

module.exports = RCodeGenerator;
