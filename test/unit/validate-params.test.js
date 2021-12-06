/**
 * (C) Copyright IBM Corp. 2021.
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

const { validateParams } = require('../../dist/lib/helper');

describe('validateParams', () => {
  it('should return null when params, requiredParams, and allParams are all null', () => {
    expect(validateParams(null, null, null)).toBeNull();
  });

  it('should return null when params, requiredParams, and allParams are all undefined', () => {
    expect(validateParams(undefined, undefined, undefined)).toBeNull();
  });

  it('should return null when params is null and requiredParams and allParams are undefined', () => {
    expect(validateParams(null, undefined, undefined)).toBeNull();
  });

  it('should return null if params is undefined and requiredParams and allParams are null', () => {
    expect(validateParams(undefined, null, null)).toBeNull();
  });

  it('should return null if params is undefined and requiredParams and allParams are empty lists', () => {
    expect(validateParams(undefined, [], [])).toBeNull();
  });

  it('should return null if params is an empty object and requiredParams and allParams are undefined', () => {
    expect(validateParams({}, undefined, undefined)).toBeNull();
  });

  it('should return null if params is null and requiredParams and allParams are empty lists', () => {
    expect(validateParams(null, [], [])).toBeNull();
  });

  it('should return null if params is an empty object and requiredParams and allParams are null', () => {
    expect(validateParams({}, null, null)).toBeNull();
  });

  it('should return null if params is non-empty and requiredParams is undefined', () => {
    expect(validateParams({ a: 'a' }, undefined, ['a'])).toBeNull();
  });

  it('should return null if params is non-empty and allParams is null', () => {
    expect(validateParams({ a: 'a', b: 'b' }, ['a'], null)).toBeNull();
  });

  it('should return null if params is non-empty and requiredParams is an empty list', () => {
    expect(validateParams({ a: 'a' }, [], ['a'])).toBeNull();
  });

  it('should return null if no parameters are missing', () => {
    expect(validateParams({ a: 'a', b: 'b', c: 'c' }, ['b', 'c'], ['a', 'b', 'c'])).toBeNull();
  });

  it('should return null if a required parameter is given and set to false', () => {
    expect(validateParams({ a: 'a', b: false }, ['a', 'b'], ['a', 'b', 'c'])).toBeNull();
  });

  it('should return null if no parameters are required', () => {
    expect(validateParams({ a: 'a', b: false }, [], ['a', 'b', 'c'])).toBeNull();
  });

  it('should return null if params is empty and no parameters are required', () => {
    expect(validateParams({}, [], ['a', 'b', 'c'])).toBeNull();
  });

  it('should return an error if there is a missing required parameter', () => {
    expect(validateParams({ a: 'a' }, ['a', 'b'], ['a', 'b', 'c']).message).toEqual(
      expect.stringContaining('Missing required parameters: b')
    );
  });

  it('should return an error if there are multiple missing required parameters', () => {
    expect(validateParams({}, ['a', 'b'], ['a', 'b', 'c']).message).toEqual(
      expect.stringContaining('Missing required parameters: a, b')
    );
  });

  it('should return an error if params is null and there are missing required parameters', () => {
    expect(validateParams(null, ['a', 'b'], ['a', 'b', 'c']).message).toEqual(
      expect.stringContaining('Missing required parameters: a, b')
    );
  });

  it('should return an error if params is undefined and there are missing required parameters', () => {
    expect(validateParams(undefined, ['a', 'b'], ['a', 'b', 'c']).message).toEqual(
      expect.stringContaining('Missing required parameters: a, b')
    );
  });

  it('should return an error if params contains an invalid parameter', () => {
    const error = validateParams({ a: 'a', d: 'd' }, ['a', 'b'], ['a', 'b', 'c']);
    expect(error.message).toEqual(expect.stringContaining('Missing required parameters: b'));
    expect(error.message).toEqual(expect.stringContaining('Found invalid parameters: d'));
  });

  it('should return an error if params contains multiple invalid parameters', () => {
    const error = validateParams({ d: 'd', e: 'e' }, ['a', 'b'], ['a', 'b', 'c']);
    expect(error.message).toEqual(expect.stringContaining('Missing required parameters: a, b'));
    expect(error.message).toEqual(expect.stringContaining('Found invalid parameters: d, e'));
  });
});
