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

const { getMissingParams } = require('../../dist/lib/helper');

describe('getMissingParams', () => {
  it('should return null when both params and requires are null', () => {
    expect(getMissingParams(null, null)).toBeNull();
  });

  it('should return null when both params and requires are undefined', () => {
    expect(getMissingParams(undefined, undefined)).toBeNull();
  });

  it('should return null when params is null and requires is undefined', () => {
    expect(getMissingParams(null, undefined)).toBeNull();
  });

  it('should return null if params is undefined and requires is null', () => {
    expect(getMissingParams(undefined, null)).toBeNull();
  });

  it('should return null if params is undefined and require is an empty list', () => {
    expect(getMissingParams(undefined, [])).toBeNull();
  });

  it('should return null if params is an empty object and require is undefined', () => {
    expect(getMissingParams({}, undefined)).toBeNull();
  });

  it('should return null if params is null and require is an empty list', () => {
    expect(getMissingParams(null, [])).toBeNull();
  });

  it('should return null if params is an empty object and require is null', () => {
    expect(getMissingParams({}, null)).toBeNull();
  });

  it('should return null if params is non-empty and require is null', () => {
    expect(getMissingParams(['a'], null)).toBeNull();
  });

  it('should return null if params is non-empty and require is undefined', () => {
    expect(getMissingParams({ a: 'a' }, undefined)).toBeNull();
  });

  it('should return null if params is non-empty and require is an empty list', () => {
    expect(getMissingParams({ a: 'a' }, [])).toBeNull();
  });

  it('should return null if no parameters are missing', () => {
    expect(getMissingParams({ a: 'a', b: 'b', c: 'c' }, ['b', 'c'])).toBeNull();
  });

  it('should throw an error if there are missing parameters', () => {
    expect(getMissingParams({ a: 'a' }, ['a', 'b']).message).toBe('Missing required parameters: b');
  });

  it('should throw an error if params is null and there are missing parameters', () => {
    expect(getMissingParams(null, ['a', 'b']).message).toBe('Missing required parameters: a, b');
  });

  it('should throw an error if params is undefined and there are missing parameters', () => {
    expect(getMissingParams(undefined, ['a', 'b']).message).toBe(
      'Missing required parameters: a, b'
    );
  });

  it('should not throw an error if a required parameter is given and set to false', () => {
    expect(getMissingParams({ a: 'a', b: false }, ['a', 'b'])).toBeNull();
  });
});
