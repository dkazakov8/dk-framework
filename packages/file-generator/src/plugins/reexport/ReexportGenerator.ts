import path from 'node:path';

import { yellow } from 'colorette';

import { BaseGenerator } from '../../BaseGenerator';
import { logsPrefix } from '../../const';
import {
  TypeCommon,
  TypeFolderPath,
  TypeModifiedFiles,
  TypePluginConstructorParams,
} from '../../types';

const logsPrefixWithPlugin = `${logsPrefix} ${yellow(`[ReexportGenerator]`)}`;

type TypeConfig = {
  folder: TypeFolderPath;
  importTemplate: (params: { fileNameNoExt: string; fileName: string }) => string;
  fileNameTemplate: (params: { folderName: string }) => string;

  headerTemplate?: string;
  exportTemplate?: (params: { fileNamesNoExt: Array<string>; folderName: string }) => string;
  includeChildrenMask?: RegExp;
  format?: (content: string) => string;
};

export class ReexportGenerator extends BaseGenerator {
  constructor(private params: TypePluginConstructorParams<TypeConfig>) {
    super();
  }

  generate(common: TypeCommon): TypeModifiedFiles {
    const { changedFiles, logs } = common;

    /**
     * Filter config by shallow match (includes) in changedFiles
     * because we need to watch folders' children
     *
     */

    const config = changedFiles
      ? this.params.config.filter(({ folder }) =>
          changedFiles.some((filePath) => filePath.includes(folder))
        )
      : this.params.config;

    if (!config.length) return [];

    this.checkFilesExistence({ paths: config.map(({ folder }) => folder) });

    const modifiedFiles: TypeModifiedFiles = [];

    config.forEach(
      ({
        folder = this.params.folder!,
        importTemplate = this.params.importTemplate!,
        fileNameTemplate = this.params.fileNameTemplate!,

        format = this.params.format,
        headerTemplate = this.params.headerTemplate,
        exportTemplate = this.params.exportTemplate,
        includeChildrenMask = this.params.includeChildrenMask,
      }) => {
        const { base: folderName } = path.parse(folder);

        const reexportFileName = fileNameTemplate({ folderName });
        const reexportFilePath = path.resolve(folder, reexportFileName);
        const childrenNames = this.getFilteredChildren({
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

        const packageOverwritten = this.createPackageFile({ folder, reexportFileName });

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

        const reexportOverwritten = this.saveFile({ content, filePath: reexportFilePath, format });

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
  }

  createPackageFile({
    folder,
    reexportFileName,
  }: {
    folder: TypeFolderPath;
    reexportFileName: string;
  }): boolean {
    return this.saveFile({
      content: `{
  "main": "${reexportFileName}",
  "types": "${reexportFileName}"
}
`,
      filePath: path.resolve(folder, 'package.json'),
    });
  }
}
