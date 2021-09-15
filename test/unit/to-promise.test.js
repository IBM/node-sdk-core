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

const fs = require('fs');
const path = require('path');
const toPromise = require('../../dist/lib/stream-to-promise').streamToPromise;

describe('toPromise()', () => {
  it('should resolve with results buffer as a string', () => {
    const file = fs.createReadStream(path.join(__dirname, '../resources/weather-data-train.csv'));
    // jest doesn't support type matching yet https://github.com/facebook/jest/issues/3457
    return expect(toPromise(file).then((res) => typeof res)).resolves.toBe('string');
  });

  it('should resolve with results string as an array', () => {
    const file = fs.createReadStream(path.join(__dirname, '../resources/weather-data-train.csv'));
    file.setEncoding('utf-8');
    return expect(toPromise(file)).resolves.toBeInstanceOf(Array);
  });
});
