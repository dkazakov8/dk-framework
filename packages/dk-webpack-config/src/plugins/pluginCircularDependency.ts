/**
 * @docs: https://github.com/aackerman/circular-dependency-plugin
 *
 */

import CircularDependencyPlugin from 'circular-dependency-plugin';

import { TypePlugin } from '../types';

export const pluginCircularDependency: TypePlugin = new CircularDependencyPlugin({
  exclude: /node_modules/,
  failOnError: true,
  allowAsyncCycles: true,
  cwd: process.cwd(),
});
