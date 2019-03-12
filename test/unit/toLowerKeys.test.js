'use strict';

const toLowerKeys = require('../../lib/helper').toLowerKeys;

describe('toLowerKeys', () => {
  it('should convert all keys of object to lower case', () => {
    const original = {
      ALLCAPS: 'a',
      MixedCase: 'b',
      lowercase: 'c',
      withNumbers123: 'd',
      sNaKe_CaSe: 'e',
    };
    const convertedKeys = Object.keys(toLowerKeys(original));
    const originalKeys = Object.keys(original);
    const allLowerCase = convertedKeys.every(key => key === key.toLowerCase());
    const allKeysPresent = originalKeys.every(key => convertedKeys.indexOf(key.toLowerCase()) > -1);
    expect(allLowerCase).toBe(true);
    expect(allKeysPresent && originalKeys.length === convertedKeys.length).toBe(true);
  });
});
