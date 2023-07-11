import chalk from 'chalk';

import { TypePluginName } from './types';
import { logsPrefix } from './const';
import { getTimeDelta } from './utils/getTimeDelta';

export function withMeasure({
  logs,
  plugin,
  callback,
}: {
  logs?: boolean;
  plugin: TypePluginName;
  callback: () => void;
}) {
  if (!logs) {
    callback();

    return;
  }

  const startTime = Date.now();

  callback();

  const endTime = getTimeDelta(startTime, Date.now());

  // eslint-disable-next-line no-console
  console.log(`${logsPrefix} ${chalk.yellow(`[${plugin}]`)} took ${chalk.yellow(endTime)} seconds`);
}
