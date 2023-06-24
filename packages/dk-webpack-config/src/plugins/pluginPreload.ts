/**
 * @docs: https://github.com/GoogleChromeLabs/preload-webpack-plugin
 *
 */

import PreloadWebpackPlugin from 'preload-webpack-plugin';

import { TypePlugin } from '../types';

export const pluginPreload: TypePlugin = new PreloadWebpackPlugin({
  rel: 'preload',
  as(filePath) {
    if (filePath.endsWith('.woff2')) return 'font';
    if (filePath.endsWith('.png') || filePath.endsWith('.jpg')) return 'image';

    return 'script';
  },
  include: 'allAssets',
  fileWhitelist: [/\.woff2$/],
});
