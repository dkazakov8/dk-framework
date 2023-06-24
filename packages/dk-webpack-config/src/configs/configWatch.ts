/**
 * @docs: https://webpack.js.org/configuration/watch
 *
 */

import { TypeConfig } from '../types';

export const configWatch: TypeConfig<boolean> = global.hotReload.enabled;
