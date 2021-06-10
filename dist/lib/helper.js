"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fileType = require("file-type");
var isstream_1 = require("isstream");
var mime_types_1 = require("mime-types");
var path_1 = require("path");
var logger_1 = require("./logger");
// custom type guards
function isFileObject(obj) {
    return Boolean(obj && obj.value);
}
function isFileStream(obj) {
    return Boolean(obj && isstream_1.isReadable(obj) && obj.path);
}
function isFileWithMetadata(obj) {
    return Boolean(obj && obj.data && isFileData(obj.data));
}
exports.isFileWithMetadata = isFileWithMetadata;
function isFileData(obj) {
    return Boolean(obj && (isstream_1.isReadable(obj) || Buffer.isBuffer(obj)));
}
exports.isFileData = isFileData;
function isEmptyObject(obj) {
    return Boolean(obj && Object.keys(obj).length === 0 && obj.constructor === Object);
}
exports.isEmptyObject = isEmptyObject;
/**
 * This function retrieves the content type of the input.
 * @param {NodeJS.ReadableStream|Buffer} inputData - The data to retrieve content type for.
 * @returns {string} the content type of the input.
 */
function getContentType(inputData) {
    var contentType = null;
    if (isFileStream(inputData)) {
        // if the inputData is a NodeJS.ReadableStream
        var mimeType = mime_types_1.lookup(inputData.path);
        contentType = { mime: mimeType || null };
    }
    else if (Buffer.isBuffer(inputData)) {
        // if the inputData is a Buffer
        contentType = fileType(inputData);
    }
    return contentType ? contentType.mime : null;
}
exports.getContentType = getContentType;
/**
 *
 * @param {string} url - the url string.
 * @returns {string}
 */
function stripTrailingSlash(url) {
    // Match a forward slash / at the end of the string ($)
    return url.replace(/\/$/, '');
}
exports.stripTrailingSlash = stripTrailingSlash;
/**
 * Return a query parameter value from a URL
 *
 * @param {string} urlStr - the url string.
 * @param {string} param - the name of the query parameter
 *                     whose value should be returned
 * @returns {string} the value of the `param` query parameter
 * @throws if urlStr is an invalid URL
 */
function getQueryParam(urlStr, param) {
    // The base URL is a dummy value just so we can process relative URLs
    var url = new URL(urlStr, 'https://foo.bar');
    return url.searchParams.get(param);
}
exports.getQueryParam = getQueryParam;
/**
 * Validates that all required params are provided
 * @param params - the method parameters.
 * @param requires - the required parameter names.
 * @returns {Error|null}
 */
function getMissingParams(params, requires) {
    var missing;
    if (!requires) {
        return null;
    }
    else if (!params) {
        missing = requires;
    }
    else {
        missing = [];
        requires.forEach(function (require) {
            if (isMissing(params[require])) {
                missing.push(require);
            }
        });
    }
    return missing.length > 0
        ? new Error("Missing required parameters: " + missing.join(', '))
        : null;
}
exports.getMissingParams = getMissingParams;
/**
 * Returns true if value is determined to be "missing". Currently defining "missing"
 * as `undefined`, `null`, or the empty string.
 *
 * @param value - the parameter value
 * @returns boolean
 */
function isMissing(value) {
    return value === undefined || value === null || value === '';
}
/**
 * Return true if 'text' is html
 * @param  {string} text - The 'text' to analyze
 * @returns {boolean} true if 'text' has html tags
 */
function isHTML(text) {
    logger_1.default.debug("Determining if the text " + text + " is HTML.");
    return /<[a-z][\s\S]*>/i.test(text);
}
exports.isHTML = isHTML;
/**
 * Returns the first match from formats that is key the params map
 * otherwise null
 * @param  {Object} params - The parameters.
 * @param  {string[]} requires - The keys we want to check
 * @returns {string|null}
 */
function getFormat(params, formats) {
    if (!formats || !params) {
        logger_1.default.debug("No formats to parse in getFormat. Returning null");
        return null;
    }
    var validFormats = formats.filter(function (item) { return item in params; });
    if (validFormats.length)
        return validFormats[0];
    logger_1.default.debug("No formats to parse in getFormat. Returning null");
    return null;
}
exports.getFormat = getFormat;
/**
 * This function builds a `form-data` object for each file parameter.
 * @param {FileWithMetadata} fileParam The file parameter.
 * @param {NodeJS.ReadableStream|Buffer} fileParam.data The data content of the file.
 * @param {string} fileParam.filename The filename of the file.
 * @param {string} fileParam.contentType The content type of the file.
 * @returns {FileObject}
 */
function buildRequestFileObject(fileParam) {
    var fileObj;
    if (isFileObject(fileParam.data)) {
        // For backward compatibility, we allow the data to be a FileObject.
        fileObj = { value: fileParam.data.value, options: {} };
        if (fileParam.data.options) {
            fileObj.options = {
                filename: fileParam.filename || fileParam.data.options.filename,
                contentType: fileParam.contentType || fileParam.data.options.contentType,
            };
        }
    }
    else {
        fileObj = {
            value: fileParam.data,
            options: {
                filename: fileParam.filename,
                contentType: fileParam.contentType,
            },
        };
    }
    // Also for backward compatibility, we allow data to be a string
    if (typeof fileObj.value === 'string') {
        fileObj.value = Buffer.from(fileObj.value);
    }
    // build filename
    // eslint-disable-next-line prefer-destructuring
    var filename = fileObj.options.filename;
    if (!filename && isFileStream(fileObj.value)) {
        // if readable stream with path property
        filename = fileObj.value.path;
    }
    // toString handles the case when path is a buffer
    fileObj.options.filename = filename ? path_1.basename(filename.toString()) : '_';
    // build contentType
    if (!fileObj.options.contentType && isFileData(fileObj.value)) {
        fileObj.options.contentType = getContentType(fileObj.value) || 'application/octet-stream';
    }
    return fileObj;
}
exports.buildRequestFileObject = buildRequestFileObject;
/**
 * This function converts an object's keys to lower case.
 * note: does not convert nested keys
 * @param {Object} obj The object to convert the keys of.
 * @returns {Object}
 */
function toLowerKeys(obj) {
    var lowerCaseObj = {};
    if (obj) {
        lowerCaseObj = Object.assign.apply(Object, __spreadArrays([{}], Object.keys(obj).map(function (key) {
            var _a;
            return (_a = {},
                _a[key.toLowerCase()] = obj[key],
                _a);
        })));
    }
    return lowerCaseObj;
}
exports.toLowerKeys = toLowerKeys;
/**
 * Constructs a service URL by formatting a parameterized URL.
 *
 * @param {string} parameterizedUrl URL that contains variable placeholders, e.g. '{scheme}://ibm.com'.
 * @param {Map<string, string>} defaultUrlVariables Map from variable names to default values.
 *  Each variable in the parameterized URL must have a default value specified in this map.
 * @param {Map<string, string>} providedUrlVariables Map from variable names to desired values.
 *  If a variable is not provided in this map,
 *  the default variable value will be used instead.
 * @returns {string} The formatted URL with all variable placeholders replaced by values.
 */
function constructServiceUrl(parameterizedUrl, defaultUrlVariables, providedUrlVariables) {
    // If null was passed, we set the variables to an empty map.
    // This results in all default variable values being used.
    if (providedUrlVariables === null) {
        providedUrlVariables = new Map();
    }
    // Verify the provided variable names.
    providedUrlVariables.forEach(function (_, name) {
        if (!defaultUrlVariables.has(name)) {
            throw new Error("'" + name + "' is an invalid variable name.\n      Valid variable names: [" + Array.from(defaultUrlVariables.keys()).sort() + "].");
        }
    });
    // Format the URL with provided or default variable values.
    var formattedUrl = parameterizedUrl;
    defaultUrlVariables.forEach(function (defaultValue, name) {
        // Use the default variable value if none was provided.
        var providedValue = providedUrlVariables.get(name);
        var formatValue = providedValue !== undefined ? providedValue : defaultValue;
        formattedUrl = formattedUrl.replace("{" + name + "}", formatValue);
    });
    return formattedUrl;
}
exports.constructServiceUrl = constructServiceUrl;
