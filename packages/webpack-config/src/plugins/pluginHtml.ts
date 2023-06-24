/**
 * @docs: https://github.com/jantimon/html-webpack-plugin
 *
 */

import path from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';

import { TypePlugin } from '../types';

export const pluginHtml: TypePlugin = new HtmlWebpackPlugin({
  filename: path.parse(global.templatePath).base,
  template: global.templatePath,
  inject: !global.ssr,
  minify: false,
  templateParameters: {
    env: global.nodeEnv,
    commitHash: global.gitCommit,
  },
});
