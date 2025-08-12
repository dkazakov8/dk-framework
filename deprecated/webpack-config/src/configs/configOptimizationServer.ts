/**
 * @docs: https://webpack.js.org/configuration/optimization
 *
 */

import { TypeConfig } from '../types';
import { getTerserConfig } from '../utils/getTerserConfig';

export const configOptimizationServer: TypeConfig<any> = {
  minimize: global.minify,
  minimizer: [getTerserConfig()],
};
