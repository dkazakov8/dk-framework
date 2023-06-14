import { TypeComparisonMatrix } from './types';

export function generateComparisonMatrix(arr: Array<any>): TypeComparisonMatrix {
  if (arr.length === 0) return [];
  if (arr.length === 1) return [[0, 0]];

  return arr.reduce((matrix, item, index) => {
    const nextIndexes = [];

    for (let nextIndex = index + 1; nextIndex < arr.length; nextIndex++) {
      nextIndexes.push(nextIndex);
    }

    nextIndexes.forEach((nextIndex) => matrix.push([index, nextIndex]));

    return matrix;
  }, [] as TypeComparisonMatrix);
}
