/**
 * @docs: https://webpack.js.org/configuration/devtool
 *
 */

import webpack from 'webpack';

import { TypeConfig } from '../types';

export const configDevTool: TypeConfig<webpack.Configuration['devtool']> = global.devTool;
