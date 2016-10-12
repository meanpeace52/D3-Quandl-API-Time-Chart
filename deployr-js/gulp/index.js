/*!
 * Copyright (C) 2010-2016, Microsoft Corporation
 *
 * This program is licensed to you under the terms of Version 2.0 of the
 * Apache License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * Apache License 2.0 (http://www.apache.org/licenses/LICENSE-2.0) for more 
 * details.
 */
 
var fs        = require('fs'),
    whitelist = require('./util/script-filter'),
    tasks     = fs.readdirSync('./gulp/tasks/').filter(whitelist);

tasks.forEach(function(task) {
	require('./tasks/' + task);
});