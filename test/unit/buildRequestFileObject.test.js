'use strict';

const fs = require('fs');
const buildRequestFileObject = require('../../lib/helper').buildRequestFileObject;
const filepath = __dirname + '/../resources/other-file.env';
const audioFile = __dirname + '/../resources/blank.wav';

describe('buildRequestFileObject', () => {
  const customName = 'custom-name.env';

  describe('filename tests', () => {
    it('should prioritze user given filename', () => {
      const fileParams = {
        data: fs.createReadStream(filepath),
        filename: customName,
      };
      const fileObj = buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.filename).toBeDefined();
      expect(fileObj.options.filename).toBe(customName);
    });

    it('should handle file object with `value` property', () => {
      const fileParams = {
        data: {
          value: fs.readFileSync(filepath),
          options: {
            filename: customName,
          },
        },
      };
      const fileObj = buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.filename).toBeDefined();
      expect(fileObj.options.filename).toBe(customName);
    });

    it('should get filename from readable stream', () => {
      const fileParams = {
        data: fs.createReadStream(filepath),
      };
      const fileObj = buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.filename).toBeDefined();
      expect(fileObj.options.filename).toBe('other-file.env');
    });

    it('should handle file object with a readable stream as its `value`', () => {
      const fileStream = fs.createReadStream(filepath);
      fileStream.path = '/fake/path/' + customName;

      const fileParams = {
        data: {
          value: fileStream,
        },
      };
      const fileObj = buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.filename).toBeDefined();
      expect(fileObj.options.filename).toBe(customName);
    });

    it('should handle path property being a buffer', () => {
      const fileStream = fs.createReadStream(filepath);
      fileStream.path = Buffer.from('/fake/path/' + customName);

      const fileParams = {
        data: {
          value: fileStream,
        },
      };
      const fileObj = buildRequestFileObject(fileParams);
      expect(Buffer.isBuffer(fileStream.path)).toBe(true);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.filename).toBeDefined();
      expect(fileObj.options.filename).toBe(customName);
    });

    it('should use an underscore when filename is not found', () => {
      const fileParams = {
        data: fs.readFileSync(filepath),
      };
      const fileObj = buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.filename).toBeDefined();
      expect(fileObj.options.filename).toBe('_');
    });
  });

  //      CONTENT TYPE
  describe('content type tests', () => {
    it('should read contentType from options in file object', () => {
      const fileParams = {
        data: {
          value: {},
          options: {
            contentType: 'audio/wave',
          },
        },
      };
      const fileObj = buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.contentType).toBeDefined();
      expect(fileObj.options.contentType).toBe('audio/wave');
    });

    it('should read contentType from user parameter', () => {
      const fileParams = {
        contentType: 'audio/wave',
      };
      const fileObj = buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.contentType).toBeDefined();
      expect(fileObj.options.contentType).toBe('audio/wave');
    });

    it('should use `getContentType` to read mime type from file object', () => {
      const fileParams = {
        data: {
          value: fs.createReadStream(audioFile),
        },
      };
      const fileObj = buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.contentType).toBeDefined();
      expect(fileObj.options.contentType).toBe('audio/wave');
    });

    it('should use `getContentType` to read mime type from data', () => {
      const fileParams = {
        data: fs.createReadStream(audioFile),
      };
      const fileObj = buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.contentType).toBeDefined();
      expect(fileObj.options.contentType).toBe('audio/wave');
    });

    it('should default to `application/octet-stream` if no other content type is defined', () => {
      const fileParams = {
        // the `lookup` package doesn't have a value for a file with extension `.env`
        data: fs.createReadStream(filepath),
      };
      const fileObj = buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.contentType).toBeDefined();
      expect(fileObj.options.contentType).toBe('application/octet-stream');
    });
  });

  //      VALUE
  describe('value tests', () => {
    it('should read value from data.value for a file object', () => {
      const data = fs.createReadStream(filepath);
      const fileParams = {
        data: {
          value: data,
        },
      };
      const fileObj = buildRequestFileObject(fileParams);
      expect(fileObj.value).toBeDefined();
      expect(fileObj.value).toBe(data);
    });

    it('should read value from data property', () => {
      const data = fs.readFileSync(filepath);
      const fileParams = {
        data,
      };
      const fileObj = buildRequestFileObject(fileParams);
      expect(fileObj.value).toBeDefined();
      expect(fileObj.value).toBe(data);
    });

    it('should convert string data to a buffer', () => {
      const data = 'just a string';
      const fileParams = {
        data,
      };
      const fileObj = buildRequestFileObject(fileParams);
      expect(fileObj.value).toBeDefined();
      expect(Buffer.isBuffer(fileObj.value)).toBe(true);
      expect(fileObj.value.toString()).toBe(data);
    });
  });
});
