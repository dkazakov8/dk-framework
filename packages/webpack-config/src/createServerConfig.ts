import webpack from 'webpack';
import SpeedMeasurePlugin from 'speed-measure-webpack-plugin';

import { TypeGlobal } from './types';

export function createServerConfig(params: TypeGlobal): webpack.Configuration {
  Object.assign(global, params);

  const config: webpack.Configuration = {
    name: 'node',
    node: require('./configs/configNode').configNode,
    mode: require('./configs/configMode').configMode,
    entry: require('./configs/configEntry').configEntry,
    stats: require('./configs/configStats').configStats,
    watch: require('./configs/configWatch').configWatch,
    module: require('./configs/configModuleServer').configModuleServer,
    output: require('./configs/configOutputServer').configOutputServer,
    target: 'node',
    devtool: require('./configs/configDevTool').configDevTool,
    plugins: require('./configs/configPluginsServer').configPluginsServer,
    resolve: require('./configs/configResolve').configResolve,
    externals: require('./configs/configExternalsServer').configExternalsServer,
    performance: require('./configs/configPerformance').configPerformance,
    optimization: require('./configs/configOptimizationServer').configOptimizationServer,
    watchOptions: require('./configs/configWatchOptions').configWatchOptions,
  };

  return global.speedMeasure
    ? (new SpeedMeasurePlugin().wrap(config as any) as webpack.Configuration)
    : config;
}
