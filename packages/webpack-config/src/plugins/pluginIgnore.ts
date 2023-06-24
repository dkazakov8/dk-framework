/**
 * @docs: https://webpack.js.org/plugins/ignore-plugin
 *
 */

import webpack from 'webpack';

import { TypePlugin } from '../types';

export const pluginIgnore: TypePlugin = new webpack.IgnorePlugin({
  resourceRegExp: /^\.\/locale$/,
  contextRegExp: /moment$/,
});
