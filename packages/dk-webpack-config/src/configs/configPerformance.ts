/**
 * @docs: https://webpack.js.org/configuration/performance
 *
 */

import webpack from 'webpack';

import { TypeConfig } from '../types';

export const configPerformance: TypeConfig<webpack.Configuration['performance']> = {
  hints: false,
};
