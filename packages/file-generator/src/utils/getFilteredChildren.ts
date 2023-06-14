import fs from 'fs';
import path from 'path';

import { TypeFolderPath } from '../types';

export function getFilteredChildren({
  folder,
  include,
  reexportFileName,
}: {
  folder: TypeFolderPath;
  include?: RegExp;
  reexportFileName?: string;
}) {
  const childrenFilenames = fs.readdirSync(folder);

  let filteredChildrenFilenames = childrenFilenames.filter(
    (fileName) => !['package.json', reexportFileName].includes(fileName)
  );

  if (include) {
    filteredChildrenFilenames = filteredChildrenFilenames.filter((fileName) =>
      include.test(fileName)
    );
  }

  /**
   * Sort file names alphabetically to avoid unnecessary rewrites
   *
   */

  filteredChildrenFilenames.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  return {
    paths: filteredChildrenFilenames.map((fileName) => path.resolve(folder, fileName)),
    names: filteredChildrenFilenames,
  };
}
