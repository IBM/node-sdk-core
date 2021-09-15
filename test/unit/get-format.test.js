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

const { getFormat } = require('../../dist/lib/helper');

describe('getFormat', () => {
  test('should return null if params is undefined', () => {
    expect(getFormat(undefined, [])).toBeNull();
  });

  test('should return null if params is null', () => {
    expect(getFormat(null, [])).toBeNull();
  });

  test('should return null if formats is undefined', () => {
    expect(getFormat({}, undefined)).toBeNull();
  });

  test('should return null if formats is null', () => {
    expect(getFormat({}, null)).toBeNull();
  });

  test('should return null if formats is the empty list', () => {
    expect(getFormat({ a: 1 }, [])).toBeNull();
  });

  test('should return null if no format match is found', () => {
    expect(getFormat({}, ['a'])).toBeNull();
  });

  test('should return the first match found', () => {
    expect(getFormat({ a: 1 }, ['a', 'b', 'c'])).toEqual('a');
  });

  test('should return the first match found even if other formats match', () => {
    expect(getFormat({ c: 3, b: 2, a: 1 }, ['a', 'b', 'c'])).toEqual('a');
  });
});
