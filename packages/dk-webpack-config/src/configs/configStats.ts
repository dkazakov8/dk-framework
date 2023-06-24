/**
 * @docs: https://webpack.js.org/configuration/stats
 *
 */

import webpack from 'webpack';

import { TypeConfig } from '../types';

export const configStats: TypeConfig<webpack.Configuration['stats']> = {
  colors: true,
  errors: true,
  errorDetails: true,

  env: false,
  all: false,
  hash: false,
  depth: false,
  assets: false,
  cached: false,
  chunks: false,
  source: false,
  builtAt: false,
  modules: false,
  reasons: false,
  version: false,
  timings: false,
  children: false,
  warnings: false,
  publicPath: false,
  chunkGroups: false,
  entrypoints: false,
  performance: false,
  moduleTrace: false,
  usedExports: false,
  cachedAssets: false,
  chunkOrigins: false,
  chunkModules: false,
  providedExports: false,

  // exclude?: StatsExcludeFilter;
  // context?: string;
  // assetsSort?: string;
  // chunksSort?: string;
  // maxModules?: number;
  // modulesSort?: string;
  // excludeAssets?: StatsExcludeFilter;
  // excludeModules?: StatsExcludeFilter;
  // warningsFilter?: string | RegExp | Array<string | RegExp> | ((warning: string) => boolean);
};
