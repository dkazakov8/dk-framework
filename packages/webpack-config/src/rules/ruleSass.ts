import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { TypeRule, TypeLoader } from '../types';

/**
 * @docs: https://github.com/webpack-contrib/css-loader
 *
 */

const loaderCss: TypeLoader = {
  loader: 'css-loader',
  options: {
    importLoaders: 1,
    sourceMap: false,
    modules: { localIdentName: '[path][local]' },
  },
};

const loaderSass: TypeLoader = {
  loader: 'sass-loader',
  options: {
    sassOptions: { includePaths: sassImportPaths },
  },
};

/**
 * @docs: https://github.com/webpack-contrib/mini-css-extract-plugin
 *
 */

const loaderExtractCss: TypeLoader = {
  loader: MiniCssExtractPlugin.loader,
};

export const ruleSass: TypeRule = {
  test: /\.s?css$/,
  exclude: sassExclude,
  use: [loaderExtractCss, loaderCss, loaderSass],
};
