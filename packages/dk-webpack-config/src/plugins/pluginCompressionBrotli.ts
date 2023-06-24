/**
 * @docs: https://webpack.js.org/plugins/compression-webpack-plugin
 *
 */

import CompressionPlugin from 'compression-webpack-plugin';

import { TypePlugin } from '../types';

export const pluginCompressionBrotli: TypePlugin = new CompressionPlugin({
  test: /\.(js|css)$/i,
  filename: '[path][name][ext].br',
  algorithm: 'brotliCompress',
  deleteOriginalAssets: false,
  compressionOptions: { level: 11 },
  minRatio: Number.MAX_SAFE_INTEGER,
});
