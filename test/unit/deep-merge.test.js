/**
 * (C) Copyright IBM Corp. 2026.
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

const { deepMerge } = require('../../dist/lib/helper');

describe('deepMerge', () => {
  it('should merge two simple objects', () => {
    const target = { a: 1, b: 2 };
    const source = { c: 3, d: 4 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });

  it('should override target properties with source properties', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should deeply merge nested objects', () => {
    const target = { a: 1, nested: { x: 10, y: 20 } };
    const source = { b: 2, nested: { y: 30, z: 40 } };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: 2, nested: { x: 10, y: 30, z: 40 } });
  });

  it('should handle multiple levels of nesting', () => {
    const target = {
      level1: {
        level2: {
          level3: {
            a: 1,
            b: 2,
          },
        },
      },
    };
    const source = {
      level1: {
        level2: {
          level3: {
            b: 3,
            c: 4,
          },
        },
      },
    };
    const result = deepMerge(target, source);
    expect(result).toEqual({
      level1: {
        level2: {
          level3: {
            a: 1,
            b: 3,
            c: 4,
          },
        },
      },
    });
  });

  it('should not mutate the target object', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = deepMerge(target, source);
    expect(target).toEqual({ a: 1, b: 2 });
    expect(result).not.toBe(target);
  });

  it('should not mutate the source object', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = deepMerge(target, source);
    expect(source).toEqual({ b: 3, c: 4 });
    expect(result).not.toBe(source);
  });

  it('should handle empty target object', () => {
    const target = {};
    const source = { a: 1, b: 2 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should handle empty source object', () => {
    const target = { a: 1, b: 2 };
    const source = {};
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should replace arrays instead of merging them', () => {
    const target = { arr: [1, 2, 3] };
    const source = { arr: [4, 5] };
    const result = deepMerge(target, source);
    expect(result).toEqual({ arr: [4, 5] });
  });

  it('should replace primitive values with objects', () => {
    const target = { a: 'string' };
    const source = { a: { nested: 'object' } };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: { nested: 'object' } });
  });

  it('should replace objects with primitive values', () => {
    const target = { a: { nested: 'object' } };
    const source = { a: 'string' };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 'string' });
  });

  it('should handle null values in source', () => {
    const target = { a: 1, b: 2 };
    const source = { b: null, c: 3 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: null, c: 3 });
  });

  it('should handle null values in target', () => {
    const target = { a: null, b: 2 };
    const source = { a: 1, c: 3 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('should merge objects with mixed nested and flat properties', () => {
    const target = {
      flat1: 'value1',
      nested: {
        a: 1,
        b: 2,
      },
      flat2: 'value2',
    };
    const source = {
      flat1: 'newValue1',
      nested: {
        b: 3,
        c: 4,
      },
      flat3: 'value3',
    };
    const result = deepMerge(target, source);
    expect(result).toEqual({
      flat1: 'newValue1',
      nested: {
        a: 1,
        b: 3,
        c: 4,
      },
      flat2: 'value2',
      flat3: 'value3',
    });
  });

  it('should handle complex nested structures', () => {
    const target = {
      config: {
        api: {
          endpoint: 'https://api.example.com',
          timeout: 5000,
        },
        features: {
          darkMode: true,
        },
      },
    };
    const source = {
      config: {
        api: {
          timeout: 10000,
          retries: 3,
        },
        features: {
          notifications: true,
        },
      },
    };
    const result = deepMerge(target, source);
    expect(result).toEqual({
      config: {
        api: {
          endpoint: 'https://api.example.com',
          timeout: 10000,
          retries: 3,
        },
        features: {
          darkMode: true,
          notifications: true,
        },
      },
    });
  });
});
