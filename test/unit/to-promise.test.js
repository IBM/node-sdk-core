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

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');
const toPromise = require('../../dist/lib/stream-to-promise').streamToPromise;

describe('toPromise()', () => {
  // Testing stream of text in Buffer mode
  it('should resolve with results buffer (text)', () => {
    const fileChecksum = crypto.createHash('md5');
    const file = fs.createReadStream(path.join(__dirname, '../resources/weather-data-train.csv'));
    const p = toPromise(file);
    file.pipe(fileChecksum);
    return p
      .then((buffer) => {
        // Check we received a buffer
        expect(buffer).toBeInstanceOf(Buffer);
        // Check it was of the correct length
        expect(buffer).toHaveLength(1794);
        // Calculate a checksum
        const promiseChecksum = crypto.createHash('md5');
        promiseChecksum.update(buffer);
        return promiseChecksum;
      })
      .then((promiseChecksum) => {
        // Verify the checksum from the promise buffer matches the original file
        expect(promiseChecksum.digest('hex')).toEqual(fileChecksum.digest('hex'));
      });
  });

  // Testing stream of text in Buffer mode
  it('should resolve with results buffer (binary)', () => {
    const fileChecksum = crypto.createHash('md5');
    const file = fs.createReadStream(path.join(__dirname, '../resources/blank.wav'));
    const p = toPromise(file);
    file.pipe(fileChecksum);
    return p
      .then((buffer) => {
        // Check we received a buffer
        expect(buffer).toBeInstanceOf(Buffer);
        // Check it was of the correct length
        expect(buffer).toHaveLength(113520);
        // Calculate a checksum
        const promiseChecksum = crypto.createHash('md5');
        promiseChecksum.update(buffer);
        return promiseChecksum;
      })
      .then((promiseChecksum) => {
        // Verify the checksum from the promise buffer matches the original file
        expect(promiseChecksum.digest('hex')).toEqual(fileChecksum.digest('hex'));
      });
  });

  // Testing stream of text in String mode
  it('should resolve with results string as an array', () => {
    const file = fs.createReadStream(path.join(__dirname, '../resources/weather-data-train.csv'));
    file.setEncoding('utf-8');
    return expect(toPromise(file)).resolves.toBeInstanceOf(Array);
  });
});
