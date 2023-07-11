/* eslint-disable no-var,vars-on-top */

import webpack from 'webpack';

export type TypeRule = webpack.RuleSetRule;
export type TypeConfig<T> = T;
export type TypeLoader = webpack.RuleSetRule;
export type TypePlugin = Omit<webpack.WebpackPluginInstance, 'apply'>;

export type TypeDevtool =
  | 'eval'
  | 'eval-cheap-source-map'
  | 'eval-cheap-module-source-map'
  | 'eval-source-map'
  | 'eval-nosources-source-map'
  | 'eval-nosources-cheap-source-map'
  | 'eval-nosources-cheap-module-source-map'
  | 'cheap-source-map'
  | 'cheap-module-source-map'
  | 'inline-cheap-source-map'
  | 'inline-cheap-module-source-map'
  | 'inline-source-map'
  | 'inline-nosources-source-map'
  | 'inline-nosources-cheap-source-map'
  | 'inline-nosources-cheap-module-source-map'
  | 'source-map'
  | 'hidden-source-map'
  | 'hidden-nosources-source-map'
  | 'hidden-nosources-cheap-source-map'
  | 'hidden-nosources-cheap-module-source-map'
  | 'hidden-cheap-source-map'
  | 'hidden-cheap-module-source-map'
  | 'nosources-source-map'
  | 'nosources-cheap-source-map'
  | 'nosources-cheap-module-source-map';

export type TypeGlobal = {
  ssr: boolean;
  alias: Record<string, string>;
  entry: Record<string, string>;
  minify: boolean;
  devTool: TypeDevtool;
  modules: Array<string>;
  nodeEnv: 'development' | 'production';
  gitCommit: string;
  hotReload: { enabled: boolean; aggregationTimeout: number };
  buildFolder: string;
  sassExclude: Array<string>;
  browserslist: Array<string>;
  templatePath: string;
  filenameHash: boolean;
  speedMeasure: boolean;
  circularCheck: boolean;
  compressFiles: boolean;
  bundleAnalyzer: { enabled: boolean; port: number };
  webpCompression: number;
  sassImportPaths: Array<string>;
  includePolyfills: boolean;
  rebuildCondition: (changes?: Set<string>, removals?: Set<string>) => boolean;
  sassIncludeGlobal: Array<string>;

  defineParams?: Record<string, Record<string, any>>;
  serviceWorker?: { entry: string; output: string };
  nodeExternalsParams?: any;
};

declare global {
  var ssr: boolean;
  var alias: Record<string, string>;
  var entry: Record<string, string>;
  var minify: boolean;
  var devTool: TypeDevtool;
  var modules: Array<string>;
  var nodeEnv: 'development' | 'production';
  var gitCommit: string;
  var hotReload: { enabled: boolean; aggregationTimeout: number };
  var buildFolder: string;
  var sassExclude: Array<string>;
  var browserslist: Array<string>;
  var templatePath: string;
  var filenameHash: boolean;
  var speedMeasure: boolean;
  var circularCheck: boolean;
  var compressFiles: boolean;
  var bundleAnalyzer: { enabled: boolean; port: number };
  var webpCompression: number;
  var sassImportPaths: Array<string>;
  var includePolyfills: boolean;
  var rebuildCondition: (changes?: Set<string>, removals?: Set<string>) => boolean;
  var sassIncludeGlobal: Array<string>;

  var defineParams: Record<string, Record<string, any>> | undefined;
  var serviceWorker: { entry: string; output: string } | undefined;
  var nodeExternalsParams: any | undefined;
}
