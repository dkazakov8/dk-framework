import { TypeGenerateFilesParams, TypeModifiedFiles } from './types';
import { withMeasure } from './withMeasure';
import { pluginMapper } from './pluginMapper';

export function applyModifications(params: TypeGenerateFilesParams) {
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
