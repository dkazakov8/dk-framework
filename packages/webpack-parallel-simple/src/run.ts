import path from 'path';
import { ChildProcess, fork } from 'child_process';

import chalk from 'chalk';

import { FIRST_FINISHED } from './utils/constants';

export type TypeConfig = {
  onInit?: (processes: Array<ChildProcess>) => void;
  bailOnError: boolean;
  configPaths: Array<string>;
  afterFirstBuild?: () => void;
};

const childProcessPath = path.resolve(__dirname, 'childProcess');

export function run(config: TypeConfig) {
  let finishedCount = 0;
  let afterFirstBuildCalled = false;

  const childProcesses = config.configPaths.map((configPath) => {
    const childProcess = fork(`${childProcessPath}`, [configPath], {
      silent: true,
      // eslint-disable-next-line no-process-env
      env: { ...process.env, FORCE_COLOR: '1' },
    });

    childProcess.stdout?.on('data', (msgBuffer: Buffer) => {
      let messageTrimmed = msgBuffer.toString().trim();

      if (!afterFirstBuildCalled && messageTrimmed.includes(FIRST_FINISHED)) {
        finishedCount += 1;
        messageTrimmed = '';

        if (finishedCount >= config.configPaths.length) {
          config.afterFirstBuild?.();

          afterFirstBuildCalled = true;
        }
      }

      if (!messageTrimmed) return;

      // eslint-disable-next-line no-console
      console.log(messageTrimmed);
    });

    childProcess.stderr?.on('data', (msgBuffer: Buffer) => {
      const messageTrimmed = msgBuffer.toString().trim();

      if (messageTrimmed.includes('DeprecationWarning')) {
        console.error(chalk.yellow(messageTrimmed));

        return;
      }

      console.error(chalk.red(messageTrimmed));

      if (config.bailOnError) process.exit(1);
    });

    return childProcess;
  });

  config.onInit?.(childProcesses);
}
