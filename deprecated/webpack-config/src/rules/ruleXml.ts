/**
 * @docs: https://webpack.js.org/guides/asset-modules
 *
 */

import { TypeLoader, TypeRule } from '../types';

/**
 * @docs: https://v4.webpack.js.org/loaders/raw-loader/
 *
 */

const loaderRaw: TypeLoader = {
  loader: 'raw-loader',
};

export const ruleXml: TypeRule = {
  test: /\.xml$/,
  use: [loaderRaw],
};
