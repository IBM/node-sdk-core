# Migration Guide for v1

## Breaking Changes

### Node Versions
Node versions 6 and 8 are no longer supported.

### Callback arguments
The old callback argument structure of `(error, body, response)` has been changed to `(error, response)`. The body is available under the `result` property of the response. The `data` property has been removed in favor of `result`.
