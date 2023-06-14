import path from 'path';

import chalk from 'chalk';

import { saveFile } from '../../utils/saveFile';
import { logsPrefix } from '../../const';
import { getFilteredChildren } from '../../utils/getFilteredChildren';
import { checkFilesExistence } from '../../utils/checkFilesExistence';
import { TypeGeneratorPlugin, TypeModifiedFiles } from '../../types';

import { createPackageFile } from './createPackageFile';
import { TypeProcessParamsReexport } from './types';

export const pluginName = 'reexport';

const logsPrefixWithPlugin = `${logsPrefix} ${chalk.yellow(`[${pluginName}]`)}`;

export const generateReexport: TypeGeneratorPlugin<TypeProcessParamsReexport> = (params) => {
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
      importTemplate,
      fileNameTemplate,
      headerTemplate,
      includeChildrenMask,
      exportTemplate,
    }) => {
      const { base: folderName } = path.parse(folder);

      const reexportFileName = fileNameTemplate({ folderName });
      const reexportFilePath = path.resolve(folder, reexportFileName);
      const childrenNames = getFilteredChildren({
        folder,
        reexportFileName,
        include: includeChildrenMask,
      }).names;
      const fileNamesNoExt = childrenNames.map((fileName) => path.parse(fileName).name);

      let content = headerTemplate || '';

      fileNamesNoExt.forEach((fileNameNoExt, index) => {
        content += importTemplate({ fileNameNoExt, fileName: childrenNames[index] });
      });

      content += exportTemplate?.({ fileNamesNoExt, folderName }) || '';

      const packageOverwritten = createPackageFile({ folder, reexportFileName });

      if (packageOverwritten) {
        modifiedFiles.push(path.resolve(folder, 'package.json'));

        if (logs) {
          // eslint-disable-next-line no-console
          console.log(
            `${logsPrefixWithPlugin} created ${path
              .resolve(folder, 'package.json')
              .replace(process.cwd(), '')}`
          );
        }
      }

      const reexportOverwritten = saveFile({ content, filePath: reexportFilePath });

      if (reexportOverwritten) {
        modifiedFiles.push(reexportFilePath);

        if (logs) {
          // eslint-disable-next-line no-console
          console.log(
            `${logsPrefixWithPlugin} created ${reexportFilePath.replace(process.cwd(), '')}`
          );
        }
      }
    }
  );

  return modifiedFiles;
};
