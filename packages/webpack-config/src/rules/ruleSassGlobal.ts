// eslint-disable-next-line @typescript-eslint/naming-convention
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { TypeRule, TypeLoader } from '../types';

/**
 * @docs: https://github.com/webpack-contrib/css-loader
 *
 */

const loaderCssGlobal: TypeLoader = {
  loader: 'css-loader',
  options: {
    sourceMap: false,
    importLoaders: 1,
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

export const ruleSassGlobal: TypeRule = {
  test: /\.s?css$/,
  include: global.sassIncludeGlobal,
  use: [
    loaderExtractCss,
    loaderCssGlobal,
    global.includePolyfills && loaderAutoprefix,
    loaderSass,
  ].filter(Boolean),
};
