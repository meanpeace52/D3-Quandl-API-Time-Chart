set.seed(12345)
library(deployrUtils)
deployrPackage("aws.s3")

# Configs S3--------------------------------------------------------------------
Sys.setenv("AWS_ACCESS_KEY_ID" = "AKIAI356G25CALROLSGA",
           "AWS_SECRET_ACCESS_KEY" = "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")

# Declares inputs---------------------------------------------------------------
deployrInput('{"name":"bucket_data", "default":"datasetstl", "render":"character", "label":"Specify S3 bucket for data"}')
deployrInput('{"name":"bucket_models", "default":"rdatamodels", "render":"character", "label":"Specify S3 bucket for models"}')
deployrInput('{"name":"input_data", "default":"alex/data/boston", "render":"character", "label":"Specify link to dataset"}')
deployrInput('{"name":"model", "default":"alex/models/3b2a298648bc69fa0d3f24c308208d2bbfa20248", "render":"character", "label":"Specify link to the model"}')
deployrInput('{"name":"yvar", "default":"", "render":"character", "label":"Specify name for Y"}')
deployrInput('{"name":"xvars", "default":"", "render":"character", "label":"Specify names for X"}')
deployrInput('{"name":"yvar_index", "default":"", "render":"character", "label":"Specify index for Y"}')
deployrInput('{"name":"xvars_index", "default":"", "render":"character", "label":"Specify indices for X"}')


# Reads model-------------------------------------------------------------------
e <- new.env()
s3load(model, bucket = bucket_models, envir = e)
result <- get(ls(e), envir = e)
rm(e)

# Reads new data----------------------------------------------------------------
e <- new.env()
s3load(input_data, bucket = bucket_data, envir = e)
newdata <- get(ls(e), envir = e)
rm(e)

# Checks columns----------------------------------------------------------------

# Dependant var
if (yvar == "") {
  if (yvar_index == "") {
    yvar <- names(newdata)[1]
  } else {
    yvar <- names(newdata)[as.numeric(yvar_index)]
  }
}

# Independant vars
if (xvars == "") {
  if (xvars_index == "") {
    xvars <- names(newdata)[-1]
  } else {
    xvars <- names(newdata)[as.numeric(strsplit(xvars_index, split = ",")[[1]])]
  }
} else {
  xvars <- strsplit(xvars, split = ",")[[1]]
}


# Restricts 'newdata'-----------------------------------------------------------
newdata <- newdata[, c(yvar, xvars)]


# Checks columns in model & 'newdata'-------------------------------------------

model_yvar <- as.character(result$model$formula)[2]
model_xvars <- names(coef(result$model))[-1]

# Checks Y var
if (model_yvar != yvar) {
  stop("Dependent variable is not the same!")
}

if (all(model_xvars %in% xvars) & all(xvars %in% model_xvars)) {
  # (1) All is ok / boston

} else if (all(model_xvars %in% xvars) & !all(xvars %in% model_xvars)) {
  # (2) Extra cols in new dataset / boston2
  newdata <- newdata[, c(yvar, model_xvars)]

} else if (!all(model_xvars %in% xvars) & all(xvars %in% model_xvars)) {
  # (3) Missing cols in new dataset / boston3
  .formula <- as.formula(sprintf("%s ~ %s", yvar, paste(xvars, collapse = " + ")))
  .family <- ifelse(is.numeric(newdata[, yvar]), gaussian, binomial)
  model <- glm(.formula, data = result$model$data, family = .family)
  result$model <- model

} else {
  # (4) Combination of (2) + (3) / boston4
  xvars <- xvars[xvars %in% model_xvars]
  newdata <- newdata[, c(yvar, xvars)]

  .formula <- as.formula(sprintf("%s ~ %s", yvar, paste(xvars, collapse = " + ")))
  .family <- ifelse(is.numeric(newdata[, yvar]), gaussian, binomial)
  model <- glm(.formula, data = result$model$data, family = .family)
  result$model <- model
}


# Makes prediction--------------------------------------------------------------

pred <- predict(result$model, newdata = newdata)
pred <- as.numeric(pred)
pred

