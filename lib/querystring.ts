/**
 * Lightweight implementation for stringify-ing query params
 *
 * @param {object<string, object>} queryParams
 * @return {String}
 */
const stringify = (queryParams: Object): string =>
  Object.keys(queryParams)
    .map((key) => `${key}=${encodeURIComponent(queryParams[key])}`)
    .join('&');

export default {
  stringify,
};
