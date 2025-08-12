/**
 * @docs: https://webpack.js.org/concepts/plugins
 *
 */

// import { pluginWorkbox } from '../plugins/pluginWorkbox';
import { pluginAnalyzer } from '../plugins/pluginAnalyzer';
import { pluginBanner } from '../plugins/pluginBanner';
import { pluginCircularDependency } from '../plugins/pluginCircularDependency';
import { pluginCompressionBrotli } from '../plugins/pluginCompressionBrotli';
import { pluginCompressionGzip } from '../plugins/pluginCompressionGzip';
import { pluginConditionalAggregate } from '../plugins/pluginConditionalAggregate';
import { pluginDefine } from '../plugins/pluginDefine';
import { pluginHtml } from '../plugins/pluginHtml';
import { pluginIgnore } from '../plugins/pluginIgnore';
import { pluginImageMinimize } from '../plugins/pluginImageMinimize';
import { pluginLoadable } from '../plugins/pluginLoadable';
import { pluginLodashModule } from '../plugins/pluginLodashModule';
import { pluginPreload } from '../plugins/pluginPreload';
import { pluginRetryChunkLoad } from '../plugins/pluginRetryChunkLoad';
import { TypeConfig } from '../types';
import { excludeFalsy } from '../utils/excludeFalsy';

export const configPlugins: TypeConfig<any> = [
  pluginHtml,
  pluginBanner,
  pluginDefine,
  pluginIgnore,
  pluginPreload,
  pluginLodashModule,
  !global.disableWebp && pluginImageMinimize,
  pluginRetryChunkLoad,
  pluginConditionalAggregate,
  global.ssr && pluginLoadable,
  // Boolean(global.serviceWorker) && pluginWorkbox,
  global.circularCheck && pluginCircularDependency,
  global.bundleAnalyzer.enabled && pluginAnalyzer,
  global.compressFiles && pluginCompressionGzip,
  global.compressFiles && pluginCompressionBrotli,
].filter(excludeFalsy);
