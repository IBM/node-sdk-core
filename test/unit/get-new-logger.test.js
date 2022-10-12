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

describe('get new logger', () => {
  let env;

  beforeEach(() => {
    env = process.env;
    process.env = {};
    jest.resetModules();
  });
  afterEach(() => {
    process.env = env;
  });

  it('should return a logger with all methods disabled by default', () => {
    const getNewLogger = setEnvironmentAndResetModule();
    const logger = getNewLogger('test-module');

    expect(logger.warn.enabled).toBeFalsy();
    expect(logger.verbose.enabled).toBeFalsy();
    expect(logger.info.enabled).toBeFalsy();
    expect(logger.error.enabled).toBeFalsy();
    expect(logger.debug.enabled).toBeFalsy();
  });

  it('should return a logger with all methods enabled when axios debug flag is set', () => {
    process.env.NODE_DEBUG = 'axios';
    const getNewLogger = setEnvironmentAndResetModule();
    const logger = getNewLogger('test-module');

    expect(logger.debug.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
    expect(logger.info.enabled).toBe(true);
    expect(logger.verbose.enabled).toBe(true);
    expect(logger.warn.enabled).toBe(true);
  });

  it('should return a logger with all methods enabled when configured with "*"', () => {
    const getNewLogger = setEnvironmentAndResetModule('test-module*');
    const logger = getNewLogger('test-module');

    expect(logger.debug.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
    expect(logger.info.enabled).toBe(true);
    expect(logger.verbose.enabled).toBe(true);
    expect(logger.warn.enabled).toBe(true);
  });

  it('should return a debug-scoped logger when configued with "debug"', () => {
    const getNewLogger = setEnvironmentAndResetModule('test-module:debug');
    const logger = getNewLogger('test-module');

    expect(logger.debug.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
    expect(logger.info.enabled).toBe(true);
    expect(logger.verbose.enabled).toBe(true);
    expect(logger.warn.enabled).toBe(true);
  });

  it('should return an error-scoped logger when configured with "error"', () => {
    const getNewLogger = setEnvironmentAndResetModule('test-module:error');
    const logger = getNewLogger('test-module');

    expect(logger.error.enabled).toBe(true);
    expect(logger.debug.enabled).toBe(false);
    expect(logger.info.enabled).toBe(false);
    expect(logger.verbose.enabled).toBe(false);
    expect(logger.warn.enabled).toBe(false);
  });

  it('should return an info-scoped logger when configured with "info"', () => {
    const getNewLogger = setEnvironmentAndResetModule('test-module:info');
    const logger = getNewLogger('test-module');

    expect(logger.info.enabled).toBe(true);
    expect(logger.warn.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
    expect(logger.debug.enabled).toBe(false);
    expect(logger.verbose.enabled).toBe(false);
  });

  it('should return a verbose-scoped logger when configued with "verbose"', () => {
    const getNewLogger = setEnvironmentAndResetModule('test-module:verbose');
    const logger = getNewLogger('test-module');

    expect(logger.verbose.enabled).toBe(true);
    expect(logger.debug.enabled).toBe(false);
    expect(logger.info.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
    expect(logger.warn.enabled).toBe(true);
  });

  it('should return a warn-scoped logger when configued with "warning"', () => {
    const getNewLogger = setEnvironmentAndResetModule('test-module:warning');
    const logger = getNewLogger('test-module');

    expect(logger.warn.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
    expect(logger.verbose.enabled).toBe(false);
    expect(logger.info.enabled).toBe(false);
    expect(logger.debug.enabled).toBe(false);
  });

  it('should prioritize stricter log levels', () => {
    const getNewLogger = setEnvironmentAndResetModule('test-module:error,test-module:verbose');
    const logger = getNewLogger('test-module');

    expect(logger.debug.enabled).toBe(false);
    expect(logger.error.enabled).toBe(true);
    expect(logger.info.enabled).toBe(true);
    expect(logger.verbose.enabled).toBe(true);
    expect(logger.warn.enabled).toBe(true);
  });
});

// the "debug" module that we rely on to provide logging functionality seems to read the
// environment variables at module-load time. For this reason, simply programatically
// re-writing the environment variables prior to calling 'getNewLogger' is not sufficient
// for proper configuration. We need to re-load the module each time.
//
// This should be fine in standard practice, as environment variables are expected to be
// set prior to executing any SDK code.
function setEnvironmentAndResetModule(debugValue) {
  process.env.DEBUG = debugValue;
  const { getNewLogger } = require('../../dist/lib/get-new-logger');
  return getNewLogger;
}
