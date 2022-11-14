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

const fs = require('fs');
const { getContentType } = require('../../dist/lib/helper');

const filepath = `${__dirname}/../resources/blank.wav`;

describe('getContentType', () => {
  it('should read content type from read stream', async () => {
    const streamFile = fs.createReadStream(filepath);
    expect(await getContentType(streamFile)).toBe('audio/wave');
  });

  it('should not get content type from read stream with corrupted path property', async () => {
    // Note add an on error handler to avoid unhandled error events
    const streamFile = fs.createReadStream(filepath).on('error', () => {});
    streamFile.path = 'unrecognizeable-format';
    expect(await getContentType(streamFile)).toBeNull();
  });

  it('should read content type from buffer', async () => {
    const bufferFile = fs.readFileSync(filepath);
    expect(await getContentType(bufferFile)).toBe('audio/vnd.wave');
  });

  it('should not read content type from a string', async () => {
    const str = 'a,b,c,d,e';
    expect(await getContentType(str)).toBeNull();
  });

  it('should not read content type from a number', async () => {
    const number = 4;
    expect(await getContentType(number)).toBeNull();
  });
});
