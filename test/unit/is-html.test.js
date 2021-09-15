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

const { isHTML } = require('../../dist/lib/helper');

describe('isHTML', () => {
  it('should return false on undefined', () => {
    expect(isHTML(undefined)).toBe(false);
  });

  it('should return false on null', () => {
    expect(isHTML(null)).toBe(false);
  });

  it('should return false on empty string', () => {
    expect(isHTML('')).toBe(false);
  });

  it('should return false on non-HTML string', () => {
    expect(isHTML('hello world!')).toBe(false);
  });

  it('should return true on string with valid HTML elements', () => {
    expect(isHTML('<title>foobar</title>')).toBe(true);
  });

  it('should return true on string with invalid HTML-like elements', () => {
    expect(isHTML('<foo></foo>')).toBe(true);
  });
});
