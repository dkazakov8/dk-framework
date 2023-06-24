/**
 * @docs: https://webpack.js.org/configuration/watch
 *
 */

import webpack from 'webpack';

import { TypeConfig } from '../types';

export const configWatchOptions: TypeConfig<webpack.Configuration['watchOptions']> = {
  aggregateTimeout: global.hotReload.aggregationTimeout,
  ignored: /node_modules/,
};
