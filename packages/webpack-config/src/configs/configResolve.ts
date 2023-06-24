/**
 * @docs: https://webpack.js.org/configuration/resolve
 *
 */

import webpack from 'webpack';

import { TypeConfig } from '../types';

export const configResolve: TypeConfig<webpack.Configuration['resolve']> = {
  modules,
  symlinks: false,
  extensions: ['.js', '.ts', '.tsx'],
  cacheWithContext: false,
  alias,
  fallback: {
    fs: false,
    path: require.resolve('path-browserify'),
    // changes behavior of setInterval! becomes not clearable
    // timers: require.resolve('timers-browserify'),
    timers: false,
  },
};
