require(deployrUtils)
deployrInput('{"name": "dataset", "render":"data.frame", "default": "" }')
deployrInput('{"name": "Ycolindex", "render":"numeric", "default": "" }')

#convert each column into number
for(i in 1:ncol(dataset)) {
  dataset[,i] = as.numeric(as.character(dataset[,i]))
}
 
colnames(dataset)[Ycolindex]<-"depvar"

lm.fit<- lm(depvar~.,data=dataset)

summary(lm.fit)

coefficients <- summary(lm.fit)$coefficients[1,1]
interceptSE <- summary(lm.fit)$coefficients[1,2]
x <- summary(lm.fit)$coefficients[2,1]
xSE <- summary(lm.fit)$coefficients[2,2]

print(lm.fit)