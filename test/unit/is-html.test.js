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
