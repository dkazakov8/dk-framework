import { TypeComparisonMatrix, TypeEnvConfig } from './types';
import { arrayDifference } from './arrayDifference';
import { errors } from './errors';

export function compareEnvByMatrix({
  envConfigs,
  matrix,
}: {
  envConfigs: Array<TypeEnvConfig>;
  matrix: TypeComparisonMatrix;
}) {
  matrix.forEach(([firstIndex, secondIndex]) => {
    const { keys: firstKeys, fileName: firstFilename } = envConfigs[firstIndex];
    const { keys: secondKeys, fileName: secondFilename } = envConfigs[secondIndex];

    const diff = arrayDifference(firstKeys, secondKeys);

    if (diff.length > 0) {
      throw new Error(
        `${
          errors.INTERSECTION_FAILED
        }: ${firstFilename} & ${secondFilename} have different keys: ${diff.join(', ')}`
      );
    }
  });
}
