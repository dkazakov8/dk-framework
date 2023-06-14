import { TypeEnvConfig, TypeComparisonMatrix } from './types';

export function generateComparisonMatrix({
  envConfigs,
}: {
  envConfigs: Array<TypeEnvConfig>;
}): TypeComparisonMatrix {
  if (envConfigs.length === 0) return [];
  if (envConfigs.length === 1) return [[0, 0]];

  return envConfigs.reduce((matrix, envConfig, index) => {
    const nextIndexes = [];

    for (let nextIndex = index + 1; nextIndex < envConfigs.length; nextIndex++) {
      nextIndexes.push(nextIndex);
    }

    nextIndexes.forEach((nextIndex) => matrix.push([index, nextIndex]));

    return matrix;
  }, [] as TypeComparisonMatrix);
}
