/**
 * (C) Copyright IBM Corp. 2019, 2021.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const { buildRequestFileObject } = require('../../dist/lib/helper');

const filepath = `${__dirname}/../resources/other-file.env`;
const audioFile = `${__dirname}/../resources/blank.wav`;

describe('buildRequestFileObject', () => {
  const customName = 'custom-name.env';

  describe('filename tests', () => {
    it('should prioritze user given filename', async () => {
      const fileParams = {
        data: fs.createReadStream(filepath),
        filename: customName,
      };
      const fileObj = await buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.filename).toBeDefined();
      expect(fileObj.options.filename).toBe(customName);
    });

    it('should handle file object with `value` property', async () => {
      const fileParams = {
        data: {
          value: fs.readFileSync(filepath),
          options: {
            filename: customName,
          },
        },
      };
      const fileObj = await buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.filename).toBeDefined();
      expect(fileObj.options.filename).toBe(customName);
    });

    it('should get filename from readable stream', async () => {
      const fileParams = {
        data: fs.createReadStream(filepath),
      };
      const fileObj = await buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.filename).toBeDefined();
      expect(fileObj.options.filename).toBe('other-file.env');
    });

    it('should handle file object with a readable stream as its `value`', async () => {
      const fileStream = fs.createReadStream(filepath);
      fileStream.path = `/fake/path/${customName}`;

      const fileParams = {
        data: {
          value: fileStream,
        },
      };
      const fileObj = await buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.filename).toBeDefined();
      expect(fileObj.options.filename).toBe(customName);
    });

    it('should handle path property being a buffer', async () => {
      const fileStream = fs.createReadStream(filepath);
      fileStream.path = Buffer.from(`/fake/path/${customName}`);

      const fileParams = {
        data: {
          value: fileStream,
        },
      };
      const fileObj = await buildRequestFileObject(fileParams);
      expect(Buffer.isBuffer(fileStream.path)).toBe(true);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.filename).toBeDefined();
      expect(fileObj.options.filename).toBe(customName);
    });

    it('should use an underscore when filename is not found', async () => {
      const fileParams = {
        data: fs.readFileSync(filepath),
      };
      const fileObj = await buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.filename).toBeDefined();
      expect(fileObj.options.filename).toBe('_');
    });
  });

  //      CONTENT TYPE
  describe('content type tests', () => {
    it('should read contentType from options in file object', async () => {
      const fileParams = {
        data: {
          value: {},
          options: {
            contentType: 'audio/wave',
          },
        },
      };
      const fileObj = await buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.contentType).toBeDefined();
      expect(fileObj.options.contentType).toBe('audio/wave');
    });

    it('should read contentType from user parameter', async () => {
      const fileParams = {
        contentType: 'audio/wave',
      };
      const fileObj = await buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.contentType).toBeDefined();
      expect(fileObj.options.contentType).toBe('audio/wave');
    });

    it('should use `getContentType` to read mime type from file object', async () => {
      const fileParams = {
        data: {
          value: fs.createReadStream(audioFile),
        },
      };
      const fileObj = await buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.contentType).toBeDefined();
      expect(fileObj.options.contentType).toBe('audio/wave');
    });

    it('should use `getContentType` to read mime type from data', async () => {
      const fileParams = {
        data: fs.createReadStream(audioFile),
      };
      const fileObj = await buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.contentType).toBeDefined();
      expect(fileObj.options.contentType).toBe('audio/wave');
    });

    it('should default to `application/octet-stream` if no other content type is defined', async () => {
      const fileParams = {
        // the `lookup` package doesn't have a value for a file with extension `.env`
        data: fs.createReadStream(filepath),
      };
      const fileObj = await buildRequestFileObject(fileParams);
      expect(fileObj.options).toBeDefined();
      expect(fileObj.options.contentType).toBeDefined();
      expect(fileObj.options.contentType).toBe('application/octet-stream');
    });
  });

  //      VALUE
  describe('value tests', () => {
    it('should read value from data.value for a file object', async () => {
      const data = fs.createReadStream(filepath);
      const fileParams = {
        data: {
          value: data,
        },
      };
      const fileObj = await buildRequestFileObject(fileParams);
      expect(fileObj.value).toBeDefined();
      expect(fileObj.value).toBe(data);
    });

    it('should read value from data property', async () => {
      const data = fs.readFileSync(filepath);
      const fileParams = {
        data,
      };
      const fileObj = await buildRequestFileObject(fileParams);
      expect(fileObj.value).toBeDefined();
      expect(fileObj.value).toBe(data);
    });

    it('should convert string data to a buffer', async () => {
      const data = 'just a string';
      const fileParams = {
        data,
      };
      const fileObj = await buildRequestFileObject(fileParams);
      expect(fileObj.value).toBeDefined();
      expect(Buffer.isBuffer(fileObj.value)).toBe(true);
      expect(fileObj.value.toString()).toBe(data);
    });
  });
});
