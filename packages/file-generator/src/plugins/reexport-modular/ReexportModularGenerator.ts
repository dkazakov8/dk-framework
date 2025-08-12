import fs from 'node:fs';
import path from 'node:path';

import { yellow } from 'colorette';

import { BaseGenerator } from '../../BaseGenerator';
import { logsPrefix } from '../../const';
import {
  TypeCommon,
  TypeFilePath,
  TypeFolderPath,
  TypeModifiedFiles,
  TypePluginConstructorParams,
} from '../../types';

const logsPrefixWithPlugin = `${logsPrefix} ${yellow(`[ReexportModularGenerator]`)}`;

type TypeSubFolderOrFile = { subFolderOrFilePath: string; moduleName: string };

type TypeConfig = {
  folder: TypeFolderPath;
  targetFile: TypeFilePath;
  childFileOrFolderName: TypeFilePath | TypeFolderPath;
  importTemplate: (params: { moduleName: string; relativePath: string }) => string;
  exportTemplate: (params: { subFoldersOfFiles: Array<TypeSubFolderOrFile> }) => string;

  headerTemplate?: string;
  includeChildrenMask?: RegExp;
  format?: (content: string) => string;
};

export class ReexportModularGenerator extends BaseGenerator {
  constructor(private params: TypePluginConstructorParams<TypeConfig>) {
    super();
  }

  getSubFoldersOrFiles({
    childrenPaths,
    childFileOrFolderName,
  }: {
    childrenPaths: Array<TypeFolderPath>;
    childFileOrFolderName: TypeFilePath | TypeFolderPath;
  }): Array<TypeSubFolderOrFile> {
    return childrenPaths.reduce(
      (subFolders, childPath) => {
        const subFolderOrFilePath = path.resolve(childPath, childFileOrFolderName);
        const moduleName = path.parse(childPath).name;

        if (fs.existsSync(subFolderOrFilePath)) {
          subFolders.push({ subFolderOrFilePath, moduleName });
        }

        return subFolders;
      },
      [] as Array<TypeSubFolderOrFile>
    );
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
        targetFile = this.params.targetFile!,
        childFileOrFolderName = this.params.childFileOrFolderName!,
        folder = this.params.folder!,
        importTemplate = this.params.importTemplate!,
        exportTemplate = this.params.exportTemplate!,

        format = this.params.format,
        headerTemplate = this.params.headerTemplate,
        includeChildrenMask = this.params.includeChildrenMask,
      }) => {
        const childrenPaths = this.getFilteredChildren({
          folder,
          include: includeChildrenMask,
        }).paths;

        const subFoldersOfFiles = this.getSubFoldersOrFiles({
          childrenPaths,
          childFileOrFolderName,
        });

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

        const reexportOverwritten = this.saveFile({ content, filePath: targetFile, format });

        if (reexportOverwritten) {
          modifiedFiles.push(targetFile);

          if (logs) {
            // eslint-disable-next-line no-console
            console.log(
              `${logsPrefixWithPlugin} created ${targetFile!.replace(process.cwd(), '')}`
            );
          }
        }
      }
    );

    return modifiedFiles;
  }
}
