/**
 * Copyright 2021 IBM Corp. All Rights Reserved.
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

const { constructServiceUrl } = require('../../dist/lib/helper');

const parameterizedUrl = '{scheme}://{domain}:{port}';
const defaultUrlVariables = new Map([
  ['scheme', 'http'],
  ['domain', 'ibm.com'],
  ['port', '9300'],
]);

describe('constructServiceUrl', () => {
  it('should use default variable values when null is passed', () => {
    expect(constructServiceUrl(parameterizedUrl, defaultUrlVariables, null)).toBe(
      'http://ibm.com:9300'
    );
  });

  it('should use the values provided and defaults for the rest', () => {
    const providedUrlVariables = new Map([
      ['scheme', 'https'],
      ['port', '22'],
    ]);

    expect(constructServiceUrl(parameterizedUrl, defaultUrlVariables, providedUrlVariables)).toBe(
      'https://ibm.com:22'
    );
  });

  it('should use all provided values', () => {
    const providedUrlVariables = new Map([
      ['scheme', 'https'],
      ['domain', 'google.com'],
      ['port', '22'],
    ]);

    expect(constructServiceUrl(parameterizedUrl, defaultUrlVariables, providedUrlVariables)).toBe(
      'https://google.com:22'
    );
  });

  it('should throw an error if a provided variable name is wrong', () => {
    const providedUrlVariables = new Map([['server', 'value']]);

    expect(() =>
      constructServiceUrl(parameterizedUrl, defaultUrlVariables, providedUrlVariables)
    ).toThrow(
      /'server' is an invalid variable name\.\n\s*Valid variable names: \[domain,port,scheme\]\./
    );
  });
});
