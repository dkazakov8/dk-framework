/**
 * @docs: https://webpack.js.org/plugins/banner-plugin
 *
 */

import webpack from 'webpack';

import { TypePlugin } from '../types';

export const pluginBanner: TypePlugin = new webpack.BannerPlugin({
  banner: `@env ${global.nodeEnv} @commit ${global.gitCommit}`,
  entryOnly: false,
});
