/**
 * @docs: https://webpack.js.org/guides/asset-modules
 *
 */

import { TypeRule, TypeLoader } from '../types';

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
