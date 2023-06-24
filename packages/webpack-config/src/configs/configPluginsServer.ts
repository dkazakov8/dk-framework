/**
 * @docs: https://webpack.js.org/concepts/plugins
 *
 */

import { TypeConfig } from '../types';
import { excludeFalsy } from '../utils/excludeFalsy';
import { pluginAnalyzer } from '../plugins/pluginAnalyzer';
import { pluginLimitChunks } from '../plugins/pluginLimitChunks';
import { pluginDefineServer } from '../plugins/pluginDefineServer';
import { pluginConditionalAggregate } from '../plugins/pluginConditionalAggregate';

export const configPluginsServer: TypeConfig<any> = [
  pluginLimitChunks,
  pluginDefineServer,
  pluginConditionalAggregate,
  global.bundleAnalyzer.enabled && pluginAnalyzer,
].filter(excludeFalsy);
