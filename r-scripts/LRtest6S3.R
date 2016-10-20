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

saveRdataToS3 <- function(fileName) {
    fileName <- paste(fileName, 'Rdata', sep=".") 
    savedFile <- s3save(mtcars, bucket="rdatamodels", object = fileName)
    return(savedFile)
}

#deployrInput('{"name": "dataset", "render":"data.frame", "default": "" }')
deployrInput('{"name": "Ycolindex", "render":"numeric", "default": "" }')
deployrInput('{"name": "Inputfile", "render":"character", "default": "" }')

#convert each column into number
#for(i in 1:ncol(dataset)) {
#  dataset[,i] = as.numeric(as.character(dataset[,i]))
#}

csvfile <- getcsv(Inputfile)
dataset <- read.csv(csvfile)

colnames(dataset)[Ycolindex]<-"depvar"

lm.fit<- lm(depvar~.,data=dataset)

#rdatafile <- saveRdataToS3(Inputfile)	

print(summary(lm.fit))