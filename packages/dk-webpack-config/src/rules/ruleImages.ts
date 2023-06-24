/**
 * @docs: https://webpack.js.org/guides/asset-modules
 *
 */

import { TypeRule } from '../types';

export const ruleImages: TypeRule = {
  test: /\.(jpe?g|png|gif)$/,
  type: 'asset/resource',
  generator: { filename: 'images/[name].webp' },
};
