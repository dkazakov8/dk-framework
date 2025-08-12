/**
 * @docs: https://github.com/gregberge/loadable-components
 *
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
import LoadablePlugin from '@loadable/webpack-plugin';

import { TypePlugin } from '../types';

export const pluginLoadable: TypePlugin = new LoadablePlugin({
  filename: 'web-loadable-stats.json',
});
