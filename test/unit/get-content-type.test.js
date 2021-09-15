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
const { getContentType } = require('../../dist/lib/helper');

const filepath = `${__dirname}/../resources/blank.wav`;

describe('getContentType', () => {
  it('should read content type from read stream', () => {
    const streamFile = fs.createReadStream(filepath);
    expect(getContentType(streamFile)).toBe('audio/wave');
  });

  it('should not get content type from read stream with corrupted path property', () => {
    const streamFile = fs.createReadStream(filepath);
    streamFile.path = 'unrecognizeable-format';
    expect(getContentType(streamFile)).toBeNull();
  });

  it('should read content type from buffer', () => {
    const bufferFile = fs.readFileSync(filepath);
    expect(getContentType(bufferFile)).toBe('audio/x-wav');
  });

  it('should not read content type from a string', () => {
    const str = 'a,b,c,d,e';
    expect(getContentType(str)).toBeNull();
  });

  it('should not read content type from a number', () => {
    const number = 4;
    expect(getContentType(number)).toBeNull();
  });
});
