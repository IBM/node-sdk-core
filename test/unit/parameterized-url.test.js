const { BaseService } = require('../../dist/lib/base-service');

const parameterizedUrl = '{scheme}://{domain}:{port}';
const defaultUrlVariables = new Map([
  ['scheme', 'http'],
  ['domain', 'ibm.com'],
  ['port', '9300'],
]);

describe('constructServiceURL', () => {
  it('should use default variable values when null is passed', () => {
    expect(BaseService.constructServiceURL(parameterizedUrl, defaultUrlVariables, null)).toBe(
      'http://ibm.com:9300'
    );
  });

  it('should use the values provided and defaults for the rest', () => {
    const providedUrlVariables = new Map([
      ['scheme', 'https'],
      ['port', '22'],
    ]);

    expect(
      BaseService.constructServiceURL(parameterizedUrl, defaultUrlVariables, providedUrlVariables)
    ).toBe('https://ibm.com:22');
  });

  it('should use all provided values', () => {
    const providedUrlVariables = new Map([
      ['scheme', 'https'],
      ['domain', 'google.com'],
      ['port', '22'],
    ]);

    expect(
      BaseService.constructServiceURL(parameterizedUrl, defaultUrlVariables, providedUrlVariables)
    ).toBe('https://google.com:22');
  });

  it('should throw an error if a provided variable name is wrong', () => {
    const providedUrlVariables = new Map([['server', 'value']]);

    expect(() =>
      BaseService.constructServiceURL(parameterizedUrl, defaultUrlVariables, providedUrlVariables)
    ).toThrow(
      /'server' is an invalid variable name\.\n\s*Valid variable names: \[domain,port,scheme\]\./
    );
  });
});
