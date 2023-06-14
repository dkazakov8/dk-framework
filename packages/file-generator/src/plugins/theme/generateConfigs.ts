import { errors } from '../../errors';

import { TypeThemeConfig, TypeThemeStrings } from './types';

const themeNameRegex = /\.([\w-]+)([\s]+)?{/;
const themeVariablesRegex = /--([\w-]+:[^;]*)/g;

export function generateConfigs({ themes }: { themes: TypeThemeStrings }): Array<TypeThemeConfig> {
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
