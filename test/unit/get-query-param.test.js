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
