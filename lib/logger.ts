import logger = require('debug');

const debug = logger('ibm-cloud-sdk-core:debug');
const error = logger('ibm-cloud-sdk-core:error');
const info = logger('ibm-cloud-sdk-core:info');
const verbose = logger('ibm-cloud-sdk-core:verbose');
const warn = logger('ibm-cloud-sdk-core:warning');

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
export default {
  debug,
  error,
  info,
  verbose,
  warn,
};
