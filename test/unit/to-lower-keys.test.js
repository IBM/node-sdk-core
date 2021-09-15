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

const { toLowerKeys } = require('../../dist/lib/helper');

describe('toLowerKeys', () => {
  it('should convert all keys of object to lower case', () => {
    const original = {
      ALLCAPS: 'a',
      MixedCase: 'b',
      lowercase: 'c',
      withNumbers123: 'd',
      sNaKe_CaSe: 'e',
    };
    const convertedKeys = Object.keys(toLowerKeys(original));
    const originalKeys = Object.keys(original);
    const allLowerCase = convertedKeys.every((key) => key === key.toLowerCase());
    const allKeysPresent = originalKeys.every(
      (key) => convertedKeys.indexOf(key.toLowerCase()) > -1
    );
    expect(allLowerCase).toBe(true);
    expect(allKeysPresent && originalKeys.length === convertedKeys.length).toBe(true);
  });
});
