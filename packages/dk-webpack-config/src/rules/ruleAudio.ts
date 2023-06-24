/**
 * @docs: https://webpack.js.org/guides/asset-modules
 *
 */

import { TypeRule } from '../types';

export const ruleAudio: TypeRule = {
  test: /\.(mp3)$/,
  type: 'asset/resource',
  generator: { filename: 'audio/[name]-[contenthash:4][ext]' },
};
