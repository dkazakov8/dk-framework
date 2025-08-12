/**
 * @docs: https://webpack.js.org/concepts/plugins
 *
 */

import { pluginAnalyzer } from '../plugins/pluginAnalyzer';
import { pluginConditionalAggregate } from '../plugins/pluginConditionalAggregate';
import { pluginDefineServer } from '../plugins/pluginDefineServer';
import { pluginLimitChunks } from '../plugins/pluginLimitChunks';
import { TypeConfig } from '../types';
import { excludeFalsy } from '../utils/excludeFalsy';

export const configPluginsServer: TypeConfig<any> = [
  pluginLimitChunks,
  pluginDefineServer,
  pluginConditionalAggregate,
  global.bundleAnalyzer.enabled && pluginAnalyzer,
].filter(excludeFalsy);
