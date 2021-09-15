/**
 * (C) Copyright IBM Corp. 2019, 2021.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
