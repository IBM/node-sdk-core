'use strict';

const fs = require('fs');
const { getContentType } = require('../../lib/helper');

const filepath = __dirname + '/../resources/blank.wav';

describe('getContentType', () => {
  it('should read content type from read stream', () => {
    const streamFile = fs.createReadStream(filepath);
    expect(getContentType(streamFile)).toBe('audio/wave');
  });

  it('should not get content type from read stream with corrupted path property', () => {
    const streamFile = fs.createReadStream(filepath);
    streamFile.path = 'unrecognizeable-format';
    expect(getContentType(streamFile)).toBeNull();
  });

  it('should read content type from buffer', () => {
    const bufferFile = fs.readFileSync(filepath);
    expect(getContentType(bufferFile)).toBe('audio/x-wav');
  });

  it('should not read content type from a string', () => {
    const str = 'a,b,c,d,e';
    expect(getContentType(str)).toBeNull();
  });

  it('should not read content type from a number', () => {
    const number = 4;
    expect(getContentType(number)).toBeNull();
  });
});
