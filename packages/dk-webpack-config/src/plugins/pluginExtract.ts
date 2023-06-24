/**
 * @docs: https://github.com/webpack-contrib/mini-css-extract-plugin
 *
 */

import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { TypePlugin } from '../types';

export const pluginExtract: TypePlugin = new MiniCssExtractPlugin({
  // Do not include folder path here! Styleguide has a bug with it trying to load fonts from
  // that folder
  filename: global.filenameHash ? '[name].[contenthash].css' : '[name].css',
  ignoreOrder: false,
  experimentalUseImportModule: true,
});
