import fs from 'fs';
import path from 'path';

import chalk from 'chalk';

import { saveFile } from '../../utils/saveFile';
import { checkFilesExistence } from '../../utils/checkFilesExistence';
import { fileEncoding, logsPrefix } from '../../const';
import { TypeGeneratorPlugin, TypeModifiedFiles } from '../../types';

import { TypeProcessParamsTheme } from './types';
import { convertCssToJs } from './convertCssToJs';

export const pluginName = 'theme';

const logsPrefixWithPlugin = `${logsPrefix} ${chalk.yellow(`[${pluginName}]`)}`;

export const generateTheme: TypeGeneratorPlugin<TypeProcessParamsTheme> = (params) => {
  const { changedFiles, logs } = params;

  /**
   * Filter config by exact match (===) in changedFiles
   *
   */

  const config = changedFiles
    ? params.config.filter(({ file }) => changedFiles.some((filePath) => filePath === file))
    : params.config;

  if (!config.length) return [];

  checkFilesExistence({ paths: config.map(({ file }) => file) });

  const modifiedFiles: TypeModifiedFiles = [];

  config.forEach(({ file, targetFile, exportTemplate }) => {
    const { name: targetFileNameNoExt } = path.parse(targetFile);

    const template = fs.readFileSync(file, fileEncoding);
    const themes = convertCssToJs(template);
    const content = exportTemplate({ targetFileNameNoExt, themes });
    const fileOverwritten = saveFile({ content, filePath: targetFile });

    if (fileOverwritten) {
      modifiedFiles.push(targetFile);

      if (logs) {
        // eslint-disable-next-line no-console
        console.log(`${logsPrefixWithPlugin} created ${targetFile.replace(process.cwd(), '')}`);
      }
    }
  });

  return modifiedFiles;
};
