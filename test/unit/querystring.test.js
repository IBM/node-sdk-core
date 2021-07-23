const { stringify } = require('../../dist/lib/querystring').default;

describe('querystring', () => {
  it('should convert params to query string format', () => {
    const params = { foo: 'bar', baz: ['qux', 'quux'], corge: '' };
    expect(stringify(params)).toBe('foo=bar&baz=qux%2Cquux&corge=');
  });
});
