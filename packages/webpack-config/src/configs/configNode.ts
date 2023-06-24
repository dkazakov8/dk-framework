/**
 * @docs: https://webpack.js.org/configuration/node
 *
 */

import webpack from 'webpack';

import { TypeConfig } from '../types';

export const configNode: TypeConfig<webpack.Configuration['node']> = {
  __filename: true,
  __dirname: true,
};
