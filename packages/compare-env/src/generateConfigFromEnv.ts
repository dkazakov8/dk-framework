import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';

import { TypeEnvConfig } from './types';

export function generateConfigFromEnv({ paths }: { paths: Array<string> }): Array<TypeEnvConfig> {
  return paths.map((filePath) => {
    const { name, ext } = path.parse(filePath);

    const fileName = name + ext;
    const fileContent = fs.readFileSync(filePath);
    const envAsObject = dotenv.parse(fileContent);

    return { fileName, envAsObject, keys: Object.keys(envAsObject) };
  });
}
