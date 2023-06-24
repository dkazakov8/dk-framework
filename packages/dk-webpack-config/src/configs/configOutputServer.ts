/**
 * @docs: https://webpack.js.org/configuration/output
 *
 */

import webpack from 'webpack';

import { TypeConfig } from '../types';

export const configOutputServer: TypeConfig<webpack.Configuration['output']> = {
  path: global.buildFolder,
  filename: '[name].js', // static name for server build
  publicPath: '/',
};
