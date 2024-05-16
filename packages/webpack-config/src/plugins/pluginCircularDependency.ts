/**
 * @docs: https://github.com/aackerman/circular-dependency-plugin
 *
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
import CircularDependencyPlugin from 'circular-dependency-plugin';

import { TypePlugin } from '../types';

export const pluginCircularDependency: TypePlugin = new CircularDependencyPlugin({
  exclude: /node_modules/,
  failOnError: true,
  allowAsyncCycles: true,
  cwd: process.cwd(),
});
