import { errors } from '../../errors';
import { arrayDifference } from '../../utils/arrayDifference';
import { TypeComparisonMatrix } from '../../utils/types';

import { TypeThemeConfig } from './types';

export function compareByMatrix({
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

    const diff = arrayDifference(firstKeys, secondKeys);

    if (diff.length > 0) {
      throw new Error(
        `${
          errors.INTERSECTION_FAILED
        }: themes ${firstName} & ${secondName} have different keys: ${diff.join(', ')}`
      );
    }
  });
}
