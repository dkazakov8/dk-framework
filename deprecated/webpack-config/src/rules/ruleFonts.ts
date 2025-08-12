/**
 * @docs: https://webpack.js.org/guides/asset-modules
 *
 */

import { TypeRule } from '../types';

export const ruleFonts: TypeRule = {
  test: /\.(woff2?|eot|ttf)$/,
  type: 'asset/resource',
  generator: { filename: 'fonts/[name]-[contenthash:4][ext]' },
};
