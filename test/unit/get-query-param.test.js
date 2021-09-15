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

const { getQueryParam } = require('../../dist/lib/helper');

describe('getQueryParam', () => {
  it('should return the parm value from a relative URL', () => {
    const nextUrl = '/api/v1/offerings?start=foo&limit=10';
    expect(getQueryParam(nextUrl, 'start')).toBe('foo');
  });

  it('should return the param value from an absolute URL', () => {
    const nextUrl = 'https://acme.com/api/v1/offerings?start=bar&limit=10';
    expect(getQueryParam(nextUrl, 'start')).toBe('bar');
  });

  it('should return null when the requested param is not present', () => {
    const nextUrl = 'https://acme.com/api/v1/offerings?start=bar&limit=10';
    expect(getQueryParam(nextUrl, 'token')).toBeNull();
  });

  it('should return null when urlStr is null', () => {
    const nextUrl = null;
    expect(getQueryParam(nextUrl, 'start')).toBeNull();
  });

  it('should return null when urlStr is the empty string', () => {
    const nextUrl = '';
    expect(getQueryParam(nextUrl, 'start')).toBeNull();
  });

  it('should return null when urlStr has no query string', () => {
    const nextUrl = '/api/v1/offerings';
    expect(getQueryParam(nextUrl, 'start')).toBeNull();
  });

  it('should throw and exception when urlStr is an invalid URL', () => {
    const nextUrl = 'https://foo.bar:baz/api/v1/offerings?start=foo';
    expect(() => {
      getQueryParam(nextUrl, 'start');
    }).toThrow(/Invalid URL/);
  });

  it('should return null when the query string is invalid', () => {
    const nextUrl = '/api/v1/offerings?start%XXfoo';
    expect(getQueryParam(nextUrl, 'start')).toBeNull();
  });

  it('should return the first value when the query string has duplicate parameters', () => {
    const nextUrl = '/api/v1/offerings?start=foo&start=bar&limit=10';
    expect(getQueryParam(nextUrl, 'start')).toBe('foo');
  });
});
