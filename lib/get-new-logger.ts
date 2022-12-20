/**
 * (C) Copyright IBM Corp. 2022.
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

import logger, { Debugger } from 'debug';

export interface SDKLogger {
  error: Debugger;
  warn: Debugger;
  info: Debugger;
  verbose: Debugger;
  debug: Debugger;
}

/**
 * Return a new logger, formatted with a particular name. The logging functions, in
 * order of increasing verbosity, are: `error`, `warn`, `info`, `verbose`, and `debug`.
 *
 * The logger will be an instance of the `debug` package and utilizes its support for
 * configuration with environment variables.
 *
 * Additionally, the logger will be turned on automatically if the "NODE_DEBUG"
 * environment variable is set to "axios".
 *
 * @param moduleName - the namespace for the logger. The name will appear in
 * the logs and it will be the name used for configuring the log level.
 *
 * @returns the new logger
 */
export function getNewLogger(moduleName: string): SDKLogger {
  const debug = logger(`${moduleName}:debug`);
  const error = logger(`${moduleName}:error`);
  const info = logger(`${moduleName}:info`);
  const verbose = logger(`${moduleName}:verbose`);
  const warn = logger(`${moduleName}:warning`);

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

  const newLogger: SDKLogger = {
    debug,
    error,
    info,
    verbose,
    warn,
  };

  return newLogger;
}
