import fs from 'node:fs';
import path from 'node:path';

import { yellow } from 'colorette';
import { CompilerOptions } from 'typescript';

import { Compiler } from '../../../ts-interface-builder';
import { BaseGenerator } from '../../BaseGenerator';
import { logsPrefix } from '../../const';
import {
  TypeCommon,
  TypeFolderPath,
  TypeModifiedFiles,
  TypePluginConstructorParams,
} from '../../types';

const logsPrefixWithPlugin = `${logsPrefix} ${yellow(`[ValidatorsGenerator]`)}`;

type TypeConfig = {
  folder: TypeFolderPath;
  targetFolder: TypeFolderPath;

  triggerFolder?: TypeFolderPath;
  headerTemplate?: string;
  compilerOptions?: CompilerOptions;
  includeChildrenMask?: RegExp;
  format?: (content: string) => string;
};

export class ValidatorsGenerator extends BaseGenerator {
  constructor(private params: TypePluginConstructorParams<TypeConfig>) {
    super();
  }

  generate(common: TypeCommon): TypeModifiedFiles {
    const { changedFiles, logs } = common;

    /**
     * Filter config by shallow match (includes) in changedFiles
     * because we need to watch folders' children
     *
     * also may be needed to include some triggerPath where models are located
     *
     */

    const config = changedFiles
      ? this.params.config.filter(({ folder, triggerFolder, includeChildrenMask }) =>
          changedFiles.some((filePath) => {
            const fileName = path.parse(filePath).base;
            const includedInFilePath = filePath.includes(folder);

            if (includeChildrenMask) {
              const includedByMask = includeChildrenMask.test(fileName);

              if (!triggerFolder) return includedInFilePath && includedByMask;

              return (includedInFilePath && includedByMask) || filePath.includes(triggerFolder);
            }

            if (!triggerFolder) return includedInFilePath;

            return includedInFilePath || filePath.includes(triggerFolder);
          })
        )
      : this.params.config;

    if (!config.length) return [];

    this.checkFilesExistence({ paths: config.map(({ folder }) => folder) });

    const modifiedFiles: TypeModifiedFiles = [];

    config.forEach(
      ({
        folder = this.params.folder!,
        targetFolder = this.params.targetFolder!,

        compilerOptions = this.params.compilerOptions,
        includeChildrenMask = this.params.includeChildrenMask,
        headerTemplate = this.params.headerTemplate,
        format = this.params.format,
      }) => {
        const headerTemplateResolved = headerTemplate ?? this.params.headerTemplate ?? '';

        const { paths: childrenPaths, names: childrenNames } = this.getFilteredChildren({
          folder,
          include: includeChildrenMask,
        });

        const compilerResults = Compiler.compile(childrenPaths, compilerOptions);
        const sideGeneratedFilePaths: Array<string> = [];

        compilerResults.result.forEach((result) => {
          let content = headerTemplateResolved;
          content += result.content;

          const filePath = path.resolve(targetFolder, path.parse(result.filePath).base);

          result.importedFiles.forEach((imported) => {
            const relativePath = path.relative(result.filePath, imported.filePath);
            const importedTargetPath = path.resolve(filePath, relativePath);

            if (!sideGeneratedFilePaths.includes(importedTargetPath)) {
              sideGeneratedFilePaths.push(importedTargetPath);
            }

            const modelOverwritten = this.saveFile({
              content: headerTemplateResolved + imported.content,
              filePath: importedTargetPath,
              format,
            });

            if (modelOverwritten) {
              modifiedFiles.push(importedTargetPath);

              if (logs) {
                // eslint-disable-next-line no-console
                console.log(
                  `${logsPrefixWithPlugin} created ${importedTargetPath.replace(process.cwd(), '')}`
                );
              }
            }
          });

          const validatorOverwritten = this.saveFile({ content, filePath, format });

          if (validatorOverwritten) {
            modifiedFiles.push(filePath);

            if (logs) {
              // eslint-disable-next-line no-console
              console.log(`${logsPrefixWithPlugin} created ${filePath.replace(process.cwd(), '')}`);
            }
          }
        });

        /**
         * Remove not used validators
         *
         */

        const targetChildren = this.getFilteredChildren({
          folder: targetFolder,
          include: includeChildrenMask,
        });

        targetChildren.names.forEach((targetChildName, index) => {
          if (childrenNames.includes(targetChildName)) return;

          const targetChildPath = targetChildren.paths[index];

          fs.unlinkSync(targetChildPath);

          modifiedFiles.push(targetChildPath);

          if (logs) {
            // eslint-disable-next-line no-console
            console.log(
              `${logsPrefixWithPlugin} removed ${targetChildPath.replace(process.cwd(), '')}`
            );
          }
        });

        if (!changedFiles) {
          sideGeneratedFilePaths.forEach((filePath) => {
            const fileFolder = path.parse(filePath).dir;

            fs.readdirSync(fileFolder).forEach((fName) => {
              const fPath = path.resolve(fileFolder, fName);

              if (fs.lstatSync(fPath).isDirectory()) return;

              if (!sideGeneratedFilePaths.includes(fPath)) {
                fs.unlinkSync(fPath);

                if (logs) {
                  // eslint-disable-next-line no-console
                  console.log(
                    `${logsPrefixWithPlugin} removed ${fPath.replace(process.cwd(), '')}`
                  );
                }
              }
            });
          });
        }
      }
    );

    return modifiedFiles;
  }
}
