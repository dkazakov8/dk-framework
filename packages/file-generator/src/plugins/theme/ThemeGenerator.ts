import fs from 'node:fs';
import path from 'node:path';

import { yellow } from 'colorette';

import { BaseGenerator, TypeComparisonMatrix } from '../../BaseGenerator';
import { fileEncoding, logsPrefix } from '../../const';
import { errors } from '../../errors';
import {
  TypeCommon,
  TypeFilePath,
  TypeModifiedFiles,
  TypePluginConstructorParams,
} from '../../types';
import { TypeThemeConfig, TypeThemeName, TypeThemeStrings, TypeThemes } from './types';

const logsPrefixWithPlugin = `${logsPrefix} ${yellow(`[ThemeGenerator]`)}`;

type TypeConfig = {
  file: TypeFilePath;
  targetFile: TypeFilePath;
  exportTemplate: (params: { targetFileNameNoExt: string; themes: TypeThemes }) => string;

  headerTemplate?: string;
  format?: (content: string) => string;
};

export class ThemeGenerator extends BaseGenerator {
  constructor(private params: TypePluginConstructorParams<TypeConfig>) {
    super();
  }

  splitCssToThemeStrings({ template }: { template: string }): TypeThemeStrings {
    const themeRegex = /\.([^}])*}/g;
    const themes = template.match(themeRegex);

    if (!themes) {
      throw new Error(`${errors.NO_THEME}: no a single theme found`);
    }

    return themes;
  }

  generateConfigs({ themes }: { themes: TypeThemeStrings }): Array<TypeThemeConfig> {
    const themeNameRegex = /\.([\w-]+)([\s]+)?{/;
    const themeVariablesRegex = /--([\w-]+:[^;]*)/g;

    return themes.map((theme) => {
      const name = theme.match(themeNameRegex)?.[1];

      if (!name) {
        throw new Error(
          `${errors.NO_THEME_NAME}: not able to extract theme name. Check formatting in themes file`
        );
      }

      const variablesLines = theme.match(themeVariablesRegex);

      if (!variablesLines) {
        throw new Error(
          `${errors.NO_THEME_VARIABLES}: not able to extract variables from theme ${name}. Only --someparam syntax is supported`
        );
      }

      const variables = variablesLines.map((variableLine) => {
        const [key, value] = variableLine.split(':').map((str) => str.trim());

        if (!value) {
          throw new Error(`${errors.EMPTY_THEME_VARIABLE}: variable for ${key} is empty`);
        }

        return { key, value };
      });

      return { name, variables };
    });
  }

  compareByMatrix({
    configs,
    matrix,
  }: {
    configs: Array<TypeThemeConfig>;
    matrix: TypeComparisonMatrix;
  }) {
    matrix.forEach(([firstIndex, secondIndex]) => {
      const { variables: firstVariables, name: firstName } = configs[firstIndex];
      const { variables: secondVariables, name: secondName } = configs[secondIndex];

      const firstKeys = firstVariables.map(({ key }) => key);
      const secondKeys = secondVariables.map(({ key }) => key);

      const diff = this.arrayDifference(firstKeys, secondKeys);

      if (diff.length > 0) {
        throw new Error(
          `${
            errors.INTERSECTION_FAILED
          }: themes ${firstName} & ${secondName} have different keys: ${diff.join(', ')}`
        );
      }
    });
  }

  convertCssToJs(template: string): TypeThemes {
    const themes = this.splitCssToThemeStrings({ template });
    const configs = this.generateConfigs({ themes });
    const matrix = this.generateComparisonMatrix(configs);

    this.compareByMatrix({ configs, matrix });

    return configs.reduce((themesJs, { name, variables }) => {
      themesJs[name] = variables.reduce(
        (vars, { key, value }) => {
          vars[key] = value;

          return vars;
        },
        {} as TypeThemes[TypeThemeName]
      );

      return themesJs;
    }, {} as TypeThemes);
  }

  generate(common: TypeCommon): TypeModifiedFiles {
    const { changedFiles, logs } = common;

    /**
     * Filter config by exact match (===) in changedFiles
     *
     */

    const config = changedFiles
      ? this.params.config.filter(({ file }) => changedFiles.some((filePath) => filePath === file))
      : this.params.config;

    if (!config.length) return [];

    this.checkFilesExistence({ paths: config.map(({ file }) => file) });

    const modifiedFiles: TypeModifiedFiles = [];

    config.forEach(
      ({
        file = this.params.file!,
        targetFile = this.params.targetFile!,
        exportTemplate = this.params.exportTemplate!,

        format = this.params.format,
        headerTemplate = this.params.headerTemplate,
      }) => {
        const { name: targetFileNameNoExt } = path.parse(targetFile);

        const template = fs.readFileSync(file, fileEncoding);
        const themes = this.convertCssToJs(template);
        const content = (headerTemplate || '') + exportTemplate({ targetFileNameNoExt, themes });
        const fileOverwritten = this.saveFile({ content, filePath: targetFile, format });

        if (fileOverwritten) {
          modifiedFiles.push(targetFile);

          if (logs) {
            // eslint-disable-next-line no-console
            console.log(`${logsPrefixWithPlugin} created ${targetFile.replace(process.cwd(), '')}`);
          }
        }
      }
    );

    return modifiedFiles;
  }
}
