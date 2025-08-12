import fs from 'node:fs';
import path from 'node:path';

import { expect } from 'chai';
import fsExtra from 'fs-extra';

import { fileEncoding } from '../src/const';
import { FileGenerator } from '../src/generateFiles';
import { ReexportGenerator } from '../src/plugins/reexport';

describe('generate files', () => {
  const folderPath = path.resolve(__dirname, 'tmp/reexportFolder');

  beforeEach(() => {
    fsExtra.copySync(path.resolve(__dirname, 'source/reexportFolder2'), folderPath);
  });

  afterEach(() => {
    fsExtra.removeSync(folderPath);
  });

  it('creates package, reexport and includes fileContentTemplate', () => {
    new FileGenerator({
      timeLogsOverall: true,
      fileModificationLogs: true,
      plugins: [
        new ReexportGenerator({
          config: [
            {
              folder: folderPath,
              importTemplate: () => '',
              fileNameTemplate: ({ folderName }) => `_${folderName}.ts`,
            },
          ],
        }),
      ],
    }).generate();

    const packageFilePath = path.resolve(folderPath, 'package.json');
    const reexportFilePath = path.resolve(folderPath, '_reexportFolder.ts');

    const packageExists = fs.existsSync(packageFilePath);

    expect(packageExists).to.equal(true);

    const reexportContent = fs.readFileSync(reexportFilePath, fileEncoding);

    expect(reexportContent).to.equal('');
  });
});
