/**
 * @docs: https://github.com/jantimon/html-webpack-plugin
 *
 */

import path from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';

import { TypePlugin } from '../types';

export const pluginHtml: TypePlugin = new HtmlWebpackPlugin({
  filename: path.parse(templatePath).base,
  template: templatePath,
  inject: !ssr,
  minify: false,
  templateParameters: {
    env: nodeEnv,
    commitHash: gitCommit,
  },
});
