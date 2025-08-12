/**
 * @docs: https://webpack.js.org/configuration/output
 *
 */

import webpack from 'webpack';

import { TypeConfig } from '../types';

export const configOutput: TypeConfig<webpack.Configuration['output']> = {
  path: global.buildFolder,
  filename: global.filenameHash ? 'js/[name].[contenthash].js' : 'js/[name].js',
  chunkFilename: global.filenameHash ? 'chunks/[name].[contenthash].js' : 'chunks/[name].js',
  publicPath: '/',
  clean: { keep: /server\.js/ },
};
