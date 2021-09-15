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

const contentType = require('../../dist/lib/content-type').default;

describe('contentType', () => {
  const mp3 = 'audio/mp3';
  const wav = 'audio/wav';

  it('should return content type from a filename', () => {
    const fname = 'fake.mp3';
    expect(contentType.fromFilename(fname)).toBe(mp3);
  });

  it('should return content type from a File object', () => {
    const File = { name: 'fake.mp3' };
    expect(contentType.fromFilename(File)).toBe(mp3);
  });

  it('should return undefined for an empty input', () => {
    expect(contentType.fromFilename({})).toBeUndefined();
  });

  it('should return content type from a buffer', () => {
    const buffer = fs.readFileSync(path.join(__dirname, '../resources/blank.wav'));
    expect(contentType.fromHeader(buffer)).toBe(wav);
  });
});
