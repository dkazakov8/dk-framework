import fs from 'fs';

import chalk from 'chalk';
import chokidar from 'chokidar';

import { TypeModifiedFiles, TypeGeneratorPlugin, TypeGenerateFilesParams } from './types';
import { logsPrefix } from './const';
import { getTimeDelta } from './utils/getTimeDelta';
import * as pluginTheme from './plugins/theme';
import * as pluginReexport from './plugins/reexport';
import * as pluginValidators from './plugins/validators';
import * as pluginReexportModular from './plugins/reexport-modular';

type TypePluginName = TypeGenerateFilesParams['configs'][number]['plugin'];

const pluginMapper: Record<TypePluginName, TypeGeneratorPlugin<any>> = {
  [pluginTheme.pluginName]: pluginTheme.generateTheme,
  [pluginReexport.pluginName]: pluginReexport.generateReexport,
  [pluginValidators.pluginName]: pluginValidators.generateValidators,
  [pluginReexportModular.pluginName]: pluginReexportModular.generateReexportModular,
};

function withMeasure({
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

function applyModifications(params: TypeGenerateFilesParams) {
  const { configs, timeLogs, changedFiles, fileModificationLogs } = params;

  let modifiedFiles: TypeModifiedFiles = [];

  configs.forEach(({ plugin, config }) => {
    withMeasure({
      logs: timeLogs,
      plugin,
      callback: () => {
        modifiedFiles = modifiedFiles.concat(
          pluginMapper[plugin]({ config, changedFiles, logs: fileModificationLogs })
        );
      },
    });
  });

  // uniq
  modifiedFiles = modifiedFiles.filter((value, index) => modifiedFiles.indexOf(value) === index);

  if (modifiedFiles.length) {
    applyModifications({
      configs,
      timeLogs,
      changedFiles: modifiedFiles,
      fileModificationLogs,
    });
  }
}

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
