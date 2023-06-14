import { errors } from '../../errors';

import { TypeThemeStrings } from './types';

const themeRegex = /\.([^}])*}/g;

export function splitCssToThemeStrings({ template }: { template: string }): TypeThemeStrings {
  const themes = template.match(themeRegex);

  if (!themes) {
    throw new Error(`${errors.NO_THEME}: no a single theme found`);
  }

  return themes;
}
