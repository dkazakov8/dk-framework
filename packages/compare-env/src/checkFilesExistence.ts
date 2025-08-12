import fs from 'node:fs';

import { errors } from './errors';

export function checkFilesExistence({ paths }: { paths: Array<string> }): void {
  paths.forEach((filePath) => {
    if (!fs.existsSync(filePath)) throw new Error(`${errors.FILE_DOES_NOT_EXIST}: ${filePath}`);
  });
}
