import webpack from 'webpack';

import { LOG_PREFIX } from './constants';

export function logStatsErrors(stats: webpack.Stats, MSG_APP: string) {
  if (stats.compilation.errors?.length) {
    const message = `${LOG_PREFIX} Errors building ${MSG_APP}\n${stats.compilation.errors
      .map((error) => error.message)
      .join('\n')}`;

    console.error(message);
  }
}
