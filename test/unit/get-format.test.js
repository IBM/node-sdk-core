const { getFormat } = require('../../dist/lib/helper');

describe('getFormat', () => {
  test('should return null if params is undefined', () => {
    expect(getFormat(undefined, [])).toBeNull();
  });

  test('should return null if params is null', () => {
    expect(getFormat(null, [])).toBeNull();
  });

  test('should return null if formats is undefined', () => {
    expect(getFormat({}, undefined)).toBeNull();
  });

  test('should return null if formats is null', () => {
    expect(getFormat({}, null)).toBeNull();
  });

  test('should return null if formats is the empty list', () => {
    expect(getFormat({ a: 1 }, [])).toBeNull();
  });

  test('should return null if no format match is found', () => {
    expect(getFormat({}, ['a'])).toBeNull();
  });

  test('should return the first match found', () => {
    expect(getFormat({ a: 1 }, ['a', 'b', 'c'])).toEqual('a');
  });

  test('should return the first match found even if other formats match', () => {
    expect(getFormat({ c: 3, b: 2, a: 1 }, ['a', 'b', 'c'])).toEqual('a');
  });
});
