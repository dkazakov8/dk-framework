import { generateComparisonMatrix } from '../../utils/generateComparisonMatrix';

import { TypeThemes, TypeThemeName } from './types';
import { generateConfigs } from './generateConfigs';
import { compareByMatrix } from './compareByMatrix';
import { splitCssToThemeStrings } from './splitCssToThemeStrings';

export function convertCssToJs(template: string): TypeThemes {
  const themes = splitCssToThemeStrings({ template });
  const configs = generateConfigs({ themes });
  const matrix = generateComparisonMatrix(configs);

  compareByMatrix({ configs, matrix });

  return configs.reduce((themesJs, { name, variables }) => {
    themesJs[name] = variables.reduce((vars, { key, value }) => {
      vars[key] = value;

      return vars;
    }, {} as TypeThemes[TypeThemeName]);

    return themesJs;
  }, {} as TypeThemes);
}
