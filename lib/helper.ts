/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
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

import extend = require('extend');
import fileType = require('file-type');
import { isReadable } from 'isstream';
import { lookup } from 'mime-types';
import { basename } from 'path';
import logger from './logger';

export interface FileObject {
  value: NodeJS.ReadableStream | Buffer | string;
  options?: FileOptions;
}

// internal interfaces
export interface FileOptions {
  filename?: string;
  contentType?: string;
}

export interface FileWithMetadata {
  data: NodeJS.ReadableStream | Buffer;
  filename: string;
  contentType: string;
}

export interface FileStream extends NodeJS.ReadableStream {
  path: string | Buffer;
}

// custom type guards
function isFileObject(obj: any): obj is FileObject {
  return Boolean(obj && obj.value);
}

function isFileStream(obj: any): obj is FileStream {
  return Boolean(obj && isReadable(obj) && obj.path);
}

export function isFileWithMetadata(obj: any): obj is FileWithMetadata {
  return Boolean(obj && obj.data && isFileData(obj.data));
}

export function isFileData(obj: any): obj is NodeJS.ReadableStream|Buffer {
  return Boolean(obj && (isReadable(obj) || Buffer.isBuffer(obj)));
}

export function isEmptyObject(obj: any): boolean {
  return Boolean(
    obj && Object.keys(obj).length === 0 && obj.constructor === Object
  );
}

/**
 * This function retrieves the content type of the input.
 * @param {NodeJS.ReadableStream|Buffer} inputData - The data to retrieve content type for.
 * @returns {string} the content type of the input.
 */
export function getContentType(
  inputData: NodeJS.ReadableStream | Buffer
): string {
  let contentType = null;
  if (isFileStream(inputData)) {
    // if the inputData is a NodeJS.ReadableStream
    const mimeType = lookup(inputData.path);
    contentType = { mime: mimeType || null };
  } else if (Buffer.isBuffer(inputData)) {
    // if the inputData is a Buffer
    contentType = fileType(inputData);
  }

  return contentType ? contentType.mime : null;
}

/**
 *
 * @param {string} url - the url string.
 * @returns {string}
 */
export function stripTrailingSlash(url: string): string {
  // Match a forward slash / at the end of the string ($)
  return url.replace(/\/$/, '');
}

/**
 * Validates that all required params are provided
 * @param params - the method parameters.
 * @param requires - the required parameter names.
 * @returns {Error|null}
 */
export function getMissingParams(
  params: { [key: string]: any },
  requires: string[]
): null | Error {
  let missing;
  if (!requires) {
    return null;
  } else if (!params) {
    missing = requires;
  } else {
    missing = [];
    requires.forEach((require) => {
      if (!params[require]) {
        missing.push(require);
      }
    });
  }
  return missing.length > 0
    ? new Error('Missing required parameters: ' + missing.join(', '))
    : null;
}

/**
 * Return true if 'text' is html
 * @param  {string} text - The 'text' to analyze
 * @returns {boolean} true if 'text' has html tags
 */
export function isHTML(text: string): boolean {
  logger.debug(`Determining if the text ${text} is HTML.`);
  return /<[a-z][\s\S]*>/i.test(text);
}

/**
 * Returns the first match from formats that is key the params map
 * otherwise null
 * @param  {Object} params - The parameters.
 * @param  {string[]} requires - The keys we want to check
 * @returns {string|null}
 */
export function getFormat(
  params: { [key: string]: any },
  formats: string[]
): string {
  if (!formats || !params) {
    logger.debug(`No formats to parse in getFormat. Returning null`);
    return null;
  }
  for (const item of formats) {
    if (item in params) {
      return item;
    }
  }

  logger.debug(`No formats to parse in getFormat. Returning null`);
  return null;
}

/**
 * this function builds a `form-data` object for each file parameter
 * @param {FileWithMetadata} fileParam - the file parameter
 * @param {NodeJS.ReadableStream|Buffer} fileParam.data - the data content of the file
 * @param (string) fileParam.filename - the filename of the file
 * @param {string} fileParam.contentType - the content type of the file
 * @returns {FileObject}
 */
export function buildRequestFileObject(
  fileParam: FileWithMetadata
): FileObject {
  let fileObj: FileObject;
  if (isFileObject(fileParam.data)) {
    // For backward compatibility, we allow the data to be a FileObject.
    fileObj = { value: fileParam.data.value, options: {} };
    if (fileParam.data.options) {
      fileObj.options = {
        filename: fileParam.filename || fileParam.data.options.filename,
        contentType: fileParam.contentType || fileParam.data.options.contentType,
      }
    }
  } else {
    fileObj = {
      value: fileParam.data,
      options: {
        filename: fileParam.filename,
        contentType: fileParam.contentType,
      }
     };
  }

  // Also for backward compatibility, we allow data to be a string
  if (typeof fileObj.value === 'string') {
    fileObj.value = Buffer.from(fileObj.value);
  }

  // build filename
  let filename: string | Buffer = fileObj.options.filename;
  if (!filename && isFileStream(fileObj.value)) {
    // if readable stream with path property
    filename = fileObj.value.path;
  }
  // toString handles the case when path is a buffer
  fileObj.options.filename = filename ? basename(filename.toString()) : '_';

  // build contentType
  if (!fileObj.options.contentType && isFileData(fileObj.value)) {
    fileObj.options.contentType = getContentType(fileObj.value) || 'application/octet-stream';
  }

  return fileObj;
}

/**
 * this function converts an object's keys to lower case
 * note: does not convert nested keys
 * @param {Object} obj - the object to convert the keys of
 * @returns {Object}
 */
export function toLowerKeys(obj: Object): Object {
  let _obj = {};
  if (obj) {
    _obj = extend(
      {},
      ...Object.keys(obj).map(key => ({
        [key.toLowerCase()]: obj[key]
      }))
    );
  }
  return _obj;
}
