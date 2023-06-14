import webpack from 'webpack';
import chalk from 'chalk';

import { LOG_PREFIX } from './constants';

export function logDone(stats: webpack.Stats, MSG_APP: string) {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const buildTime = (stats.endTime - stats.startTime) / 1000;

  // eslint-disable-next-line no-console
  console.log(
    `${LOG_PREFIX} finished building ${MSG_APP} within ${chalk.yellow(buildTime)} seconds`
  );
}
