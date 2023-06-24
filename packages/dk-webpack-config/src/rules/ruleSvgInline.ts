/**
 * @docs: https://webpack.js.org/guides/asset-modules
 *
 */

import { TypeRule } from '../types';

export const ruleSvgInline: TypeRule = {
  test: /\.svg$/,
  type: 'asset/source',
};
