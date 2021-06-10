"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger = require("debug");
var debug = logger('ibm-cloud-sdk-core:debug');
var error = logger('ibm-cloud-sdk-core:error');
var info = logger('ibm-cloud-sdk-core:info');
var verbose = logger('ibm-cloud-sdk-core:verbose');
var warn = logger('ibm-cloud-sdk-core:warning');
// enable loggers if axios flag is set & mimic log levels severity
if (process.env.NODE_DEBUG === 'axios') {
    debug.enabled = true;
}
if (debug.enabled) {
    verbose.enabled = true;
}
if (verbose.enabled) {
    info.enabled = true;
}
if (info.enabled) {
    warn.enabled = true;
}
if (warn.enabled) {
    error.enabled = true;
}
// export loggers;
exports.default = {
    debug: debug,
    error: error,
    info: info,
    verbose: verbose,
    warn: warn,
};
