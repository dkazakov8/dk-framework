/**
 * @docs: https://webpack.js.org/guides/asset-modules
 *
 */

import { TypeRule } from '../types';

export const ruleVideoServer: TypeRule = {
  test: /\.(mp4|webm)$/,
  type: 'asset/resource',
  generator: { filename: 'video/[name][ext]', emit: false },
};
