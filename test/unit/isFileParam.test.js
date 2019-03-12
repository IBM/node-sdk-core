'use strict';

const fs = require('fs');
const isFileParam = require('../../lib/helper').isFileParam;

const resources = __dirname + '/../resources/';
const textFile = fs.readFileSync(resources + 'weather_data_train.csv');

describe('isFileParam', () => {
  // correctly determines a text file
  it('should consider text buffer a file', () => {
    expect(isFileParam(textFile)).toBe(true);
  });

  // correctly determines an audio file
  it('should consider audio buffer a file', () => {
    const audioFile = fs.readFileSync(resources + 'blank.wav');
    expect(isFileParam(audioFile)).toBe(true);
  });

  it('should not think a normal object is a file', () => {
    const nonFileObject = { file: 'this is not a real file' };
    expect(isFileParam(nonFileObject)).toBe(false);
  });

  it('should look at `data` property to determine if file param', () => {
    const fileFormParam = { data: textFile };
    expect(isFileParam(fileFormParam)).toBe(true);
  });

  it('should not think object is file just because of `data` property', () => {
    const nonFileObject = { data: 'should not be interpreted as file' };
    expect(isFileParam(nonFileObject)).toBe(false);
  });

  it('should consider a read stream a file', () => {
    const readStream = fs.createReadStream(resources + 'weather_data_train.csv');
    expect(isFileParam(readStream)).toBe(true);
  });

  // write stream?
  // value property?
});
