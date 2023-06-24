/**
 * @docs: https://webpack.js.org/plugins/image-minimizer-webpack-plugin
 * @docs: https://github.com/imagemin/imagemin-webp
 *
 * This plugin adds compressed versions of images
 *
 */

import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';

import { TypePlugin } from '../types';

export const pluginImageMinimize: TypePlugin = new ImageMinimizerPlugin({
  minimizer: {
    implementation: ImageMinimizerPlugin.imageminMinify,
    filename: 'images/[name].webp',
    options: {
      plugins: [['imagemin-webp', { quality: 100, method: global.webpCompression }]],
    },
  },
  test: /\.(webp)$/,
  loader: false,
  deleteOriginalAssets: true,
});
