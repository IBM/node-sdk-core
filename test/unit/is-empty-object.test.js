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

const { isEmptyObject } = require('../../dist/lib/helper');

describe('isEmptyObject', () => {
  it('should return true for an empty object', () => {
    const emptyObj = {};
    expect(isEmptyObject(emptyObj)).toBe(true);
  });

  it('should return false for empty array', () => {
    const emptyArr = [];
    expect(isEmptyObject(emptyArr)).toBe(false);
  });

  it('should return false for empty string', () => {
    const emptyStr = '';
    expect(isEmptyObject(emptyStr)).toBe(false);
  });

  it('should return false for zero', () => {
    const zero = 0;
    expect(isEmptyObject(zero)).toBe(false);
  });

  it('should return false for non-empty object', () => {
    const obj = { a: 1, b: 2 };
    expect(isEmptyObject(obj)).toBe(false);
  });

  it('should return true for an object with its properties deleted', () => {
    const obj = { a: 1, b: 2 };
    delete obj.a;
    delete obj.b;
    expect(isEmptyObject(obj)).toBe(true);
  });
});
