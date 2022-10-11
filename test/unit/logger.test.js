/**
 * (C) Copyright IBM Corp. 2019, 2022.
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

describe('Logger', () => {
  let env;

  beforeEach(() => {
    jest.resetModules();
    env = process.env;
    process.env = {};
  });
  afterEach(() => {
    process.env = env;
  });

  it('should return an instance of the logger', () => {
    const logger = require('../../dist/lib/logger');
    expect(logger).toBeTruthy();
  });

  it('no logger should be enabled', () => {
    const logger = require('../../dist/lib/logger').default;
    expect(logger.warn.enabled).toBeFalsy();
    expect(logger.verbose.enabled).toBeFalsy();
    expect(logger.info.enabled).toBeFalsy();
    expect(logger.error.enabled).toBeFalsy();
    expect(logger.debug.enabled).toBeFalsy();
  });

  it('should enable all loggers using the name "ibm-cloud-sdk-core"', () => {
    process.env.DEBUG = 'ibm-cloud-sdk-core*';
    const logger = require('../../dist/lib/logger').default;

    expect(logger.debug.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
    expect(logger.info.enabled).toBe(true);
    expect(logger.verbose.enabled).toBe(true);
    expect(logger.warn.enabled).toBe(true);
  });

  it('should enable scoped loggers using the name "ibm-cloud-sdk-core"', () => {
    process.env.DEBUG = 'ibm-cloud-sdk-core:warning';
    const logger = require('../../dist/lib/logger').default;

    expect(logger.debug.enabled).toBe(false);
    expect(logger.verbose.enabled).toBe(false);
    expect(logger.info.enabled).toBe(false);
    expect(logger.warn.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
  });
});
