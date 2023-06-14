import fs from 'fs';

import chalk from 'chalk';
import chokidar from 'chokidar';
import ws from 'ws';

import { TypeServerParams } from './types';

const watchLogsPrefix = `${chalk.green(`[PAGE-RELOAD]`)} ${chalk.yellow('[watch]')}`;

export function startFileWatcher(options: TypeServerParams, wsServer: ws.Server) {
  const { watchPaths, aggregationTimeout, changedFilesLogs, ignored } = options;

  let changedFilesLogsData: Array<{ type: string; filePath: string; mtime?: fs.Stats['mtimeMs'] }> =
    [];
  let watchDebounceTimeout: NodeJS.Timeout;
  let watcher = chokidar.watch(watchPaths, { ignoreInitial: true, ignored });

  function addWatchers() {
    watcher
      .on('add', fileChanged('add'))
      .on('change', fileChanged('change'))
      .on('unlink', fileChanged('unlink'));
  }

  function fileChanged(type: string) {
    return (filePath: string, stats?: fs.Stats) => {
      changedFilesLogsData.push({ type, filePath, mtime: stats?.mtimeMs });

      clearTimeout(watchDebounceTimeout);
      watchDebounceTimeout = setTimeout(() => {
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
          wsServer.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) client.send('reload');
          });

          changedFilesLogsData = [];

          watcher = chokidar.watch(watchPaths, { ignoreInitial: true });
          addWatchers();
        });
      }, aggregationTimeout || 0);
    };
  }

  addWatchers();
}
