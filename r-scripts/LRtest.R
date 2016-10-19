#a<- c(2,2,3,3,4,4,4,3,NA,7)
#b<- c(45, 40, 42, 49, 55, 35, 64, 74, 90, 45)
#datasetwithNA<- data.frame(a, b) 

require(deployrUtils)
deployrInput('{"name": "datasetwithNA", "render":"data.frame", "default": "" }')
#should be able to retrieve datasetwithNA @ this point - only testing if R will take a 
#numeric with blanks from JS and convert the blank to "NA" 

#convert each column into number
for(i in 1:ncol(datasetwithNA)) {
  datasetwithNA[,i] = as.numeric(as.character(datasetwithNA[,i]))
}

dataset <- na.omit(datasetwithNA)
#ugh, need something better for line 13