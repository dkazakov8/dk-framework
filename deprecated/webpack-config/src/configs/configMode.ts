/**
 * @docs: https://webpack.js.org/configuration/mode
 *
 */

import webpack from 'webpack';

import { TypeConfig } from '../types';

export const configMode: TypeConfig<webpack.Configuration['mode']> = global.nodeEnv;
