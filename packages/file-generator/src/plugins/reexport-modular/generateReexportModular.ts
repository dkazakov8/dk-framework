import path from 'path';

import chalk from 'chalk';

import { saveFile } from '../../utils/saveFile';
import { logsPrefix } from '../../const';
import { getFilteredChildren } from '../../utils/getFilteredChildren';
import { TypeGeneratorPlugin, TypeModifiedFiles } from '../../types';
import { checkFilesExistence } from '../../utils/checkFilesExistence';

import { getSubFoldersOrFiles } from './getSubFoldersOrFiles';
import { TypeProcessParamsReexportModular } from './types';

export const pluginName = 'reexport-modular';

const logsPrefixWithPlugin = `${logsPrefix} ${chalk.yellow(`[${pluginName}]`)}`;

export const generateReexportModular: TypeGeneratorPlugin<TypeProcessParamsReexportModular> = (
  params
) => {
  const { changedFiles, logs } = params;

  /**
   * Filter config by shallow match (includes) in changedFiles
   * because we need to watch folders' children
   *
   */

  const config = changedFiles
    ? params.config.filter(({ folder }) =>
        changedFiles.some((filePath) => filePath.includes(folder))
      )
    : params.config;

  if (!config.length) return [];

  checkFilesExistence({ paths: config.map(({ folder }) => folder) });

  const modifiedFiles: TypeModifiedFiles = [];

  config.forEach(
    ({
      folder,
      targetFile,
      exportTemplate,
      importTemplate,
      headerTemplate,
      includeChildrenMask,
      childFileOrFolderName,
    }) => {
      const childrenPaths = getFilteredChildren({ folder, include: includeChildrenMask }).paths;

      const subFoldersOfFiles = getSubFoldersOrFiles({ childrenPaths, childFileOrFolderName });

      let content = headerTemplate || '';

      subFoldersOfFiles.forEach(({ subFolderOrFilePath, moduleName }) => {
        const targetFileFolder = path.parse(targetFile).dir;
        const folderOrFilePathNoExt = path.resolve(
          path.parse(subFolderOrFilePath).dir,
          path.parse(subFolderOrFilePath).name
        );
        const relativePath = path
          .relative(targetFileFolder, folderOrFilePathNoExt)
          .replace(/\\/g, '/');

        content += importTemplate({ moduleName, relativePath });
      });

      content += exportTemplate({ subFoldersOfFiles });

      const reexportOverwritten = saveFile({ content, filePath: targetFile });

      if (reexportOverwritten) {
        modifiedFiles.push(targetFile);

        if (logs) {
          // eslint-disable-next-line no-console
          console.log(`${logsPrefixWithPlugin} created ${targetFile.replace(process.cwd(), '')}`);
        }
      }
    }
  );

  return modifiedFiles;
};
