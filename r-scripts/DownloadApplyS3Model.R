require(deployrUtils)
library("aws.s3")

accessKey <- "AKIAI356G25CALROLSGA"
secretKey <- "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"
bucketName <- "datasetstl"

Sys.setenv("AWS_ACCESS_KEY_ID" = accessKey,
           "AWS_SECRET_ACCESS_KEY" = secretKey)

getcsv <- function(fileName) {
    baseName <- tail(unlist(strsplit(fileName, "/")), n=1)
    tmpFile <- paste("/tmp", baseName, sep="/")
    savedFile <- save_object(fileName, file=tmpFile, bucket=bucketName)
    return(savedFile)
}


deployrInput('{"name": "Ycolindex", "render":"numeric", "default": "" }')
deployrInput('{"name": "Inputfile", "render":"character", "default": "" }')
deployrInput('{"name": "Inputmodel", "render":"character", "default": "" }')


if (Inputmodel != ''){
    s3load(Inputmodel, bucket = "rdatamodels")
    
}else{
    csvfile <- getcsv(Inputfile)
    dataset <- read.csv(csvfile)
    fileName <- paste(Inputfile, 'Rdata', sep=".")
    colnames(dataset)[Ycolindex]<-"depvar"
    lm.fit<- lm(depvar~.,data=dataset)
    s3save(dataset, lm.fit, bucket="rdatamodels", object = fileName)
}

print(summary(lm.fit))