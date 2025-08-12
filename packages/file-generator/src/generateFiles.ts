import fs from 'node:fs';

import chalk from 'chalk';
import chokidar from 'chokidar';

import { applyModifications } from './applyModifications';
import { logsPrefix } from './const';
import { TypeGenerateFilesParams } from './types';
import { getTimeDelta } from './utils/getTimeDelta';

export function generateFiles(params: TypeGenerateFilesParams) {
  const startTime = Date.now();

  applyModifications(params);

  const endTime = getTimeDelta(startTime, Date.now());

  if (params.timeLogsOverall) {
    // eslint-disable-next-line no-console
    console.log(`${logsPrefix} finished in ${chalk.yellow(endTime)} seconds`);
  }

  if (params.watch) generateFilesOnChange(params);
}

const watchLogsPrefix = `${logsPrefix} ${chalk.yellow('[watch]')}`;

export function generateFilesOnChange(options: TypeGenerateFilesParams) {
  const { paths, onStart, onFinish, aggregationTimeout, changedFilesLogs } = options.watch!;

  let changedFilesLogsData: Array<{ type: string; filePath: string; mtime?: fs.Stats['mtimeMs'] }> =
    [];
  let watchDebounceTimeout: NodeJS.Timeout;
  let watcher = chokidar.watch(paths, { ignoreInitial: true });

  let isGenerating = false;

  function addWatchers() {
    watcher
      .on('add', fileChanged('add'))
      .on('change', fileChanged('change'))
      .on('unlink', fileChanged('unlink'));
  }

  function fileChanged(type: string) {
    return (filePath: string, stats?: fs.Stats) => {
      if (isGenerating) {
        // eslint-disable-next-line no-console
        console.log(
          `${watchLogsPrefix} change in ${filePath.replace(
            process.cwd(),
            ''
          )} discarded because generation is in progress`
        );

        return;
      }

      changedFilesLogsData.push({ type, filePath, mtime: stats?.mtimeMs });

      clearTimeout(watchDebounceTimeout);
      watchDebounceTimeout = setTimeout(() => {
        isGenerating = true;

        let changedFiles = changedFilesLogsData.map((params) => params.filePath);
        changedFiles = changedFiles.filter((value, index) => changedFiles.indexOf(value) === index);

        if (changedFilesLogs) {
          const formattedLogs = changedFilesLogsData
            .map((params) => {
              const shortFilePath = params.filePath.replace(process.cwd(), '');

              return `${chalk.blue(`[${params.type}]`)} ${
                params.mtime ? chalk.grey(`[${params.mtime}] `) : ''
              }${shortFilePath}`;
            })
            .join('\n');

          // eslint-disable-next-line no-console
          console.log(`${watchLogsPrefix} triggered by\n${formattedLogs}`);
        }

        void watcher.close().then(() => {
          onStart?.();

          generateFiles({ ...options, changedFiles, watch: undefined });

          onFinish?.();

          changedFilesLogsData = [];

          watcher = chokidar.watch(paths, { ignoreInitial: true });
          addWatchers();

          isGenerating = false;
        });
      }, aggregationTimeout || 0);
    };
  }

  addWatchers();
}
