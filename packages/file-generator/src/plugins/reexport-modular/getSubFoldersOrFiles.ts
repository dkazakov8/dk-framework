import path from 'path';
import fs from 'fs';

import { TypeFilePath, TypeFolderPath } from '../../types';

import { TypeSubFolderOrFile } from './types';

export function getSubFoldersOrFiles({
  childrenPaths,
  childFileOrFolderName,
}: {
  childrenPaths: Array<TypeFolderPath>;
  childFileOrFolderName: TypeFilePath | TypeFolderPath;
}): Array<TypeSubFolderOrFile> {
  return childrenPaths.reduce((subFolders, childPath) => {
    const subFolderOrFilePath = path.resolve(childPath, childFileOrFolderName);
    const moduleName = path.parse(childPath).name;

    if (fs.existsSync(subFolderOrFilePath)) {
      subFolders.push({ subFolderOrFilePath, moduleName });
    }

    return subFolders;
  }, [] as Array<TypeSubFolderOrFile>);
}
