'use strict';

const { isEmptyObject } = require('../../lib/helper');

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
