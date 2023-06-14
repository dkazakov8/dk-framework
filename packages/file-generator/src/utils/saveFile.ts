import fs from 'fs';

import fsExtra from 'fs-extra';

import { fileEncoding } from '../const';

export function saveFile(params: { content: string; filePath: string }): boolean {
  const { content, filePath } = params;

  /**
   * Prevent file overwriting if content is the same
   *
   */

  const oldFileContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, fileEncoding) : null;

  if (content === oldFileContent) return false;

  fsExtra.outputFileSync(filePath, content, fileEncoding);

  return true;
}
