/**
 * @docs: https://webpack.js.org/configuration/externals
 *
 */

import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';

import { TypeConfig } from '../types';

export const configExternalsServer: TypeConfig<webpack.Configuration['externals']> = [
  nodeExternals(global.nodeExternalsParams) as any,
];
