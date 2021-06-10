"use strict";
/* eslint-disable prettier/prettier, arrow-body-style */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Stringify query params, Watson-style
 *
 * Why? The server that processes auth tokens currently only accepts the *exact* string, even if it's invalid for a URL.
 * Properly url-encoding percent characters causes it to reject the token
 * So, this is a custom qs.stringify function that properly encodes everything except watson-token, passing it along verbatim
 *
 * @param {object<string, object>} queryParams
 * @return {String}
 */
var stringify = function (queryParams) {
    return Object.keys(queryParams)
        .map(function (key) {
        return (key + "=" + (key === 'watson-token'
            ? queryParams[key]
            : encodeURIComponent(queryParams[key]))); // the server chokes if the token is correctly url-encoded
    })
        .join('&');
};
exports.default = {
    stringify: stringify
};
