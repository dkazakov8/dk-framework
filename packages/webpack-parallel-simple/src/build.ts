import chalk from 'chalk';
import webpack from 'webpack';

import { logDone } from './utils/logDone';
import { logError } from './utils/logError';
import { getAppName } from './utils/getAppName';
import { logStatsErrors } from './utils/logStatsErrors';
import { logStatsWarnings } from './utils/logStatsWarnings';
import { LOG_PREFIX, FIRST_FINISHED } from './utils/constants';

export function build({ config }: { config: webpack.Configuration }) {
  const MSG_APP = chalk.yellow(getAppName(config));

  // eslint-disable-next-line no-console
  console.log(`${LOG_PREFIX} Started ${config.watch ? 'watching' : 'building'} ${MSG_APP}`);

  webpack(config, finishedCallback);

  let firstCompiled = false;

  // eslint-disable-next-line consistent-return
  function finishedCallback(err: Error | undefined, stats: webpack.Stats | undefined) {
    if (err) return logError(err);

    // eslint-disable-next-line consistent-return
    if (!stats) return;

    logStatsErrors(stats, MSG_APP);
    logStatsWarnings(stats, MSG_APP);

    // eslint-disable-next-line no-console
    console.log(stats.toString(config.stats));

    logDone(stats, MSG_APP);

    if (!firstCompiled) {
      /**
       * Async logging is for separation from other logs
       *
       */

      setTimeout(() => {
        // eslint-disable-next-line no-console
        console.log(`${FIRST_FINISHED} ${MSG_APP}`);

        firstCompiled = true;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      }, 300);
    }
  }
}
