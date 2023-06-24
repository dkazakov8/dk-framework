/**
 * @docs: https://github.com/webpack-contrib/webpack-bundle-analyzer
 *
 */

import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { TypePlugin } from '../types';

export const pluginAnalyzer: TypePlugin = new BundleAnalyzerPlugin({
  logLevel: 'silent',
  analyzerPort: global.bundleAnalyzer.port,
  statsOptions: null,
  openAnalyzer: false,
  analyzerMode: 'server',
  defaultSizes: 'parsed',
  analyzerHost: '127.0.0.1',
  statsFilename: 'stats.json',
  reportFilename: 'report.html',
  generateStatsFile: false,
});
