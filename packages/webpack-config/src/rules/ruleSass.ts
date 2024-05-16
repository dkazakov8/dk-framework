// eslint-disable-next-line @typescript-eslint/naming-convention
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
    sassOptions: { includePaths: global.sassImportPaths },
  },
};

const loaderAutoprefix: TypeLoader = {
  loader: 'postcss-loader',
  options: {
    sourceMap: false,
    postcssOptions: {
      plugins: [['autoprefixer']],
    },
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
  exclude: global.sassExclude,
  use: [
    loaderExtractCss,
    loaderCss,
    global.includePolyfills && loaderAutoprefix,
    loaderSass,
  ].filter(Boolean),
};
