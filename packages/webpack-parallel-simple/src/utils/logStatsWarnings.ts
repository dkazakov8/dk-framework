import webpack from 'webpack';
import chalk from 'chalk';

import { LOG_PREFIX } from './constants';

export function logStatsWarnings(stats: webpack.Stats, MSG_APP: string) {
  if (stats.hasWarnings()) {
    const info = stats.toJson();

    const message = info.warnings!.map((warning) => warning.message).join('\n');

    // eslint-disable-next-line no-console
    console.log(`${LOG_PREFIX} Warnings building ${MSG_APP}`);
    // eslint-disable-next-line no-console
    console.log(chalk.yellow(message));
  }
}
