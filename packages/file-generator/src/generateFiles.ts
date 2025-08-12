import fs from 'node:fs';

import chokidar from 'chokidar';
import { blue, gray, yellow } from 'colorette';

import { logsPrefix } from './const';
import { TypeGenerateFilesParams, TypeModifiedFiles } from './types';

function getTimeDelta(date1: number, date2: number) {
  const TIMING_PRECISION = 3;
  const MS_IN_SECOND = 1000;

  return ((date2 - date1) / MS_IN_SECOND).toFixed(TIMING_PRECISION);
}

export class FileGenerator {
  private watchLogsPrefix = `${logsPrefix} ${yellow('[watch]')}`;
  private changedFilesLogsData: Array<{
    type: 'add' | 'change' | 'unlink';
    filePath: string;
    mtime?: fs.Stats['mtimeMs'];
  }> = [];
  private watchDebounceTimeout?: NodeJS.Timeout;
  private watcher?: chokidar.FSWatcher;
  private isGenerating = false;

  constructor(private params: TypeGenerateFilesParams) {}

  generate(): void {
    const startTime = Date.now();

    this.applyModifications();

    this.logOverall(getTimeDelta(startTime, Date.now()));

    this.setupWatcher();
  }

  private logChangedFiles() {
    if (!this.params.watch?.changedFilesLogs) return;

    const formattedLogs = this.changedFilesLogsData
      .map((params) => {
        const shortFilePath = params.filePath.replace(process.cwd(), '');

        return `${blue(`[${params.type}]`)} ${
          params.mtime ? gray(`[${params.mtime}] `) : ''
        }${shortFilePath}`;
      })
      .join('\n');

    console.log(`${this.watchLogsPrefix} triggered by\n${formattedLogs}`);
  }

  private logOverall(endTime: string) {
    if (!this.params.timeLogsOverall) return;

    console.log(`${logsPrefix} finished in ${yellow(endTime)} seconds`);
  }

  private applyModifications(
    changedFiles?: TypeGenerateFilesParams['changedFiles']
  ): TypeModifiedFiles {
    const { plugins, fileModificationLogs } = this.params;

    let modifiedFiles: TypeModifiedFiles = [];

    plugins.forEach((plugin) => {
      modifiedFiles = modifiedFiles.concat(
        plugin.generate({ changedFiles, logs: fileModificationLogs })
      );
    });

    if (modifiedFiles.length) {
      this.applyModifications(
        modifiedFiles.filter((value, index) => modifiedFiles.indexOf(value) === index)
      );
    }

    return modifiedFiles;
  }

  private setupWatcher(): void {
    if (!this.params.watch) return;

    this.changedFilesLogsData = [];
    this.watcher = chokidar.watch(this.params.watch.paths, { ignoreInitial: true });
    this.isGenerating = false;

    this.addWatchers();
  }

  private addWatchers(): void {
    if (!this.watcher) return;

    this.watcher
      .on('add', this.fileChanged('add'))
      .on('change', this.fileChanged('change'))
      .on('unlink', this.fileChanged('unlink'));
  }

  private fileChanged(type: 'add' | 'change' | 'unlink') {
    return (filePath: string, stats?: fs.Stats): void => {
      if (this.isGenerating) {
        console.log(
          `${this.watchLogsPrefix} change in ${filePath.replace(
            process.cwd(),
            ''
          )} discarded because generation is in progress`
        );

        return;
      }

      this.changedFilesLogsData.push({ type, filePath, mtime: stats?.mtimeMs });

      clearTimeout(this.watchDebounceTimeout);

      this.watchDebounceTimeout = setTimeout(() => {
        this.isGenerating = true;
        this.logChangedFiles();

        void this.watcher?.close().then(() => {
          this.params.watch?.onStart?.();

          const startTime = Date.now();

          this.applyModifications(
            this.changedFilesLogsData
              .map((params) => params.filePath)
              .filter((value, index, arr) => arr.indexOf(value) === index)
          );

          this.logOverall(getTimeDelta(startTime, Date.now()));

          this.params.watch?.onFinish?.();

          this.setupWatcher();
        });
      }, this.params.watch?.aggregationTimeout || 0);
    };
  }
}
