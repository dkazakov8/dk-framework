import path from 'path';
import fs from 'fs';

import { expect } from 'chai';
import fsExtra from 'fs-extra';

import { fileEncoding } from '../src/const';
import { generateFiles } from '../src/generateFiles';

describe('generate files', () => {
  const folderPath = path.resolve(__dirname, 'tmp/reexportFolder');

  beforeEach(() => {
    fsExtra.copySync(path.resolve(__dirname, 'source/reexportFolder2'), folderPath);
  });

  afterEach(() => {
    fsExtra.removeSync(folderPath);
  });

  it('creates package, reexport and includes fileContentTemplate', () => {
    generateFiles({
      timeLogs: true,
      timeLogsOverall: true,
      fileModificationLogs: true,
      configs: [
        {
          plugin: 'reexport',
          config: [
            {
              folder: folderPath,
              importTemplate: () => '',
              fileNameTemplate: ({ folderName }) => `_${folderName}.ts`,
            },
          ],
        },
      ],
    });

    const packageFilePath = path.resolve(folderPath, 'package.json');
    const reexportFilePath = path.resolve(folderPath, '_reexportFolder.ts');

    const packageExists = fs.existsSync(packageFilePath);

    expect(packageExists).to.equal(true);

    const reexportContent = fs.readFileSync(reexportFilePath, fileEncoding);

    expect(reexportContent).to.equal('');
  });
});
