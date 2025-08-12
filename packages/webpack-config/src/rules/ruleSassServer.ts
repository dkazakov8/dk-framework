import { TypeLoader, TypeRule } from '../types';

/**
 * @docs: https://github.com/webpack-contrib/css-loader
 *
 */

const loaderCssServer: TypeLoader = {
  loader: 'css-loader',
  options: {
    importLoaders: 1,
    sourceMap: false,
    modules: { localIdentName: '[path][local]', exportOnlyLocals: true },
  },
};

export const ruleSassServer: TypeRule = {
  test: /\.s?css$/,
  exclude: global.sassExclude,
  use: [loaderCssServer],
};
