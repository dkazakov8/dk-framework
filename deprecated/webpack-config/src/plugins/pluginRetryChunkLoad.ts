/**
 * @docs: https://github.com/mattlewis92/webpack-retry-chunk-load-plugin
 *
 */

import { RetryChunkLoadPlugin } from 'webpack-retry-chunk-load-plugin';

import { TypePlugin } from '../types';

export const pluginRetryChunkLoad: TypePlugin = new RetryChunkLoadPlugin({
  // optional stringified function to get the cache busting query string appended to the script src
  // if not set will default to appending the string `?cache-bust=true`
  // cacheBust: `function() { return Date.now(); }`,
  // optional value to set the amount of time in milliseconds before trying to load the chunk again. Default is 0
  // if string, value must be code to generate a delay value. Receives retryCount as argument
  // e.g. `function(retryAttempt) { return retryAttempt * 1000 }`
  retryDelay: 2000,
  // optional value to set the maximum number of retries to load the chunk. Default is 1
  maxRetries: 5,
  // optional list of chunks to which retry script should be injected
  // if not set will add retry script to all chunks that have webpack script loading
  // chunks: ['chunkName'],
  // optional code to be executed in the browser context if after all retries chunk is not loaded.
  // if not set - nothing will happen and error will be returned to the chunk loader.
  // lastResortScript: "window.location.href='/500.html';",
});
