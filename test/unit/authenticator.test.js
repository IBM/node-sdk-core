'use strict';

const { Authenticator } = require('../../dist/auth');

describe('Authenticator', () => {
  it('should throw if "new" keyword is not used to create an instance', () => {
    expect(() => {
      // prettier-ignore
      // eslint-disable-next-line new-cap
      Authenticator();
    }).toThrow();
  });

  // relying on individual authenticator tests to test the rest of this implementation
});
