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

const { stripTrailingSlash } = require('../../dist/lib/helper');

describe('stripTrailingSlash', () => {
  test('should strip one slash from the end of url with a single trailing slash', () => {
    const url = 'https://ibmcloud.net';
    const urlWithSlash = `${url}/`;
    expect(stripTrailingSlash(urlWithSlash)).toEqual(url);
  });

  test('should not strip anything from a url without trailing slashes', () => {
    const url = 'https://ibmcloud.net';
    expect(stripTrailingSlash(url)).toEqual(url);
  });

  test('should return an empty string on empty string', () => {
    const url = '';
    expect(stripTrailingSlash(url)).toEqual(url);
  });
});
