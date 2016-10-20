require(deployrUtils)
library("aws.s3")

deployrInput('{"name": "datacsv", "render": "character", "default": ""}')

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

csvfile <- getcsv(datacsv)

my.csv <- read.csv(csvfile)

if (file.exists(csvfile)) 
    file.remove(csvfile)

rdatafile <- saveRdataToS3(datacsv)	

print(rdatafile)

#print(my.csv)

score <- my.csv