/**
 * @docs: https://webpack.js.org/plugins/limit-chunk-count-plugin
 *
 */

import webpack from 'webpack';

import { TypePlugin } from '../types';

export const pluginLimitChunks: TypePlugin = new webpack.optimize.LimitChunkCountPlugin({
  maxChunks: 1,
});
