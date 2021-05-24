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
