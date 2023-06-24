/**
 * @docs: https://webpack.js.org/plugins/define-plugin
 *
 */

import webpack from 'webpack';

import { TypePlugin } from '../types';
import { getDefineParams } from '../utils/getDefineParams';

export const pluginDefine: TypePlugin = new webpack.DefinePlugin(
  getDefineParams({ isClient: true })
);
