import { generateComparisonMatrix } from '../../utils/generateComparisonMatrix';
import { compareByMatrix } from './compareByMatrix';
import { generateConfigs } from './generateConfigs';
import { splitCssToThemeStrings } from './splitCssToThemeStrings';
import { TypeThemeName, TypeThemes } from './types';

export function convertCssToJs(template: string): TypeThemes {
  const themes = splitCssToThemeStrings({ template });
  const configs = generateConfigs({ themes });
  const matrix = generateComparisonMatrix(configs);

  compareByMatrix({ configs, matrix });

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
