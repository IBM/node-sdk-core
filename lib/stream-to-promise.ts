import { Stream } from 'stream';

/**
 * Helper method that can be bound to a stream - it sets the output to utf-8, captures all of the results, and returns a promise that resolves to the final text
 * Essentially a smaller version of concat-stream wrapped in a promise
 *
 * @param {Stream} stream Optional stream param for when not bound to an existing stream instance.
 * @return {Promise}
 */
export function streamToPromise(stream: Stream): Promise<any> {
  stream = stream || this;
  return new Promise((resolve, reject) => {
    const results = [];
    stream
      .on('data', (result) => {
        results.push(result);
      })
      .on('end', () => {
        resolve(Buffer.isBuffer(results[0]) ? Buffer.concat(results).toString() : results);
      })
      .on('error', reject);
  });
}
