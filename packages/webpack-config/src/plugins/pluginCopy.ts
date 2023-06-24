/**
 * @docs: https://webpack.js.org/plugins/copy-webpack-plugin
 *
 */

import CopyPlugin from 'copy-webpack-plugin';

import { TypePlugin } from '../types';

export const pluginCopy: TypePlugin = new CopyPlugin({ patterns: global.copyFilesConfig });
