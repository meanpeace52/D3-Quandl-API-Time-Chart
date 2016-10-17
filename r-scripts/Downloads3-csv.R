require(deployrUtils)
#install.packages("ggplot2")
#deployrPackage("ggplot2")

#help(package="ggplot2")
library("aws.s3")

deployrInput('{"name": "datacsv", "render": "character", "default": ""}')

accessKey <- "AKIAI356G25CALROLSGA"
secretKey <- "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"
bucketName <- "datasetstl"

getcsv <- function(fileName) {
    baseName <- tail(unlist(strsplit(fileName, "/")), n=1)
    tmpFile <- paste("/tmp", baseName, sep="/")
    savedFile <- save_object(fileName, file=tmpFile, bucket=bucketName,
                             key=accessKey, secret=secretKey)
    return(savedFile)
}

csvfile <- getcsv(datacsv)

my.csv <- read.csv(csvfile)

if (file.exists(csvfile)) 
    file.remove(csvfile)

print(my.csv)
score <- my.csv