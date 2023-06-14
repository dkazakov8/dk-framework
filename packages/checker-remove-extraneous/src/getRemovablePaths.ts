import get from 'lodash.get';

export function getRemovablePaths(params: {
  data: any;
  paths: Array<string>;

  prevPath?: string;
  levelIndex?: number;
  pathByArray?: Array<string>;
  pathsOptimized?: Array<string>;
}): Array<string> {
  const { data, prevPath, paths, levelIndex = 0, pathByArray, pathsOptimized = [] } = params;

  paths.forEach((child, index) => {
    const childSplitByArrayIndex = pathByArray || child.split(/\[[0-9]+]\./);
    const currentPath = childSplitByArrayIndex![levelIndex];
    const nextPath = childSplitByArrayIndex![levelIndex + 1];

    const pathOptimized = prevPath != null ? `${prevPath}[${index}].${currentPath}` : currentPath;

    if (!nextPath) {
      if (typeof get(data, pathOptimized) === 'undefined') return;

      // eslint-disable-next-line consistent-return
      return pathsOptimized.push(pathOptimized);
    }

    const arr = !currentPath
      ? data
      : (get(levelIndex === 0 ? data : child, currentPath) as Array<string>);

    // eslint-disable-next-line consistent-return
    return getRemovablePaths({
      data,
      prevPath: pathOptimized,
      paths: arr,
      levelIndex: levelIndex + 1,
      pathByArray: childSplitByArrayIndex,
      pathsOptimized,
    });
  });

  return pathsOptimized;
}
