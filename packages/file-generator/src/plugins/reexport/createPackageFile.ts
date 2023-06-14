import path from 'path';

import { TypeFolderPath } from '../../types';
import { saveFile } from '../../utils/saveFile';

export function createPackageFile({
  folder,
  reexportFileName,
}: {
  folder: TypeFolderPath;
  reexportFileName: string;
}): boolean {
  return saveFile({
    content: `{
  "main": "${reexportFileName}",
  "types": "${reexportFileName}"
}
`,
    filePath: path.resolve(folder, 'package.json'),
  });
}
