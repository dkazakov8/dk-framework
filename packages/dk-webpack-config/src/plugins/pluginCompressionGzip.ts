/**
 * @docs: https://webpack.js.org/plugins/compression-webpack-plugin
 *
 */

import CompressionPlugin from 'compression-webpack-plugin';

import { TypePlugin } from '../types';

export const pluginCompressionGzip: TypePlugin = new CompressionPlugin({
  test: /\.(js|css)$/i,
  filename: '[path][name][ext].gz',
  algorithm: 'gzip',
  deleteOriginalAssets: false,
  compressionOptions: { level: 9 },
  minRatio: Number.MAX_SAFE_INTEGER,
});
