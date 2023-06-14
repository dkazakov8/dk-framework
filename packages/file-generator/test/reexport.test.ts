import path from 'path';
import fs from 'fs';

import { expect } from 'chai';
import fsExtra from 'fs-extra';

import { fileEncoding } from '../src/const';
import { generateReexport } from '../src/plugins/reexport';
import { createPackageFile } from '../src/plugins/reexport/createPackageFile';

describe('create package.json', () => {
  afterEach(() => {
    fsExtra.emptydirSync(path.resolve(__dirname, 'tmp'));
  });

  it('successfully', () => {
    const folder = path.resolve(__dirname, 'tmp');
    const packageFilePath = path.resolve(__dirname, 'tmp/package.json');
    const reexportFilePath = path.resolve(__dirname, 'tmp/_tmp.ts');

    const firstTry = createPackageFile({
      folder,
      reexportFileName: path.parse(reexportFilePath).base,
    });

    expect(firstTry).to.equal(true);

    const secondTry = createPackageFile({
      folder,
      reexportFileName: path.parse(reexportFilePath).base,
    });

    expect(secondTry).to.equal(false);

    const newContent = fs.readFileSync(packageFilePath, fileEncoding);

    expect(newContent).to.equal(`{
  "main": "_tmp.ts",
  "types": "_tmp.ts"
}
`);
  });
});

describe('generate reexpoort', () => {
  const folderPath = path.resolve(__dirname, 'tmp/reexportFolder');

  beforeEach(() => {
    fsExtra.copySync(path.resolve(__dirname, 'source/reexportFolder2'), folderPath);
  });

  afterEach(() => {
    fsExtra.removeSync(folderPath);
  });

  it('creates package, reexport and includes fileContentTemplate', () => {
    generateReexport({
      config: [
        {
          folder: folderPath,
          importTemplate: () => '',
          headerTemplate: '// some-comment',
          fileNameTemplate: ({ folderName }) => `_${folderName}.ts`,
        },
      ],
      logs: true,
    });

    const packageFilePath = path.resolve(folderPath, 'package.json');
    const reexportFilePath = path.resolve(folderPath, '_reexportFolder.ts');

    const packageExists = fs.existsSync(packageFilePath);
    const reexportExists = fs.existsSync(reexportFilePath);

    const reexportContent = fs.readFileSync(reexportFilePath, fileEncoding);

    expect(packageExists).to.equal(true);
    expect(reexportExists).to.equal(true);
    expect(reexportContent).to.equal('// some-comment');
  });

  it('creates reexport with relevant imports', () => {
    generateReexport({
      config: [
        {
          folder: folderPath,
          importTemplate: ({ fileNameNoExt }) => `import * from './${fileNameNoExt}';\n`,
          fileNameTemplate: ({ folderName }) => `_${folderName}.ts`,
        },
      ],
    });

    const reexportFilePath = path.resolve(folderPath, '_reexportFolder.ts');

    const reexportContent = fs.readFileSync(reexportFilePath, fileEncoding);

    expect(reexportContent).to.equal(`import * from './a';
import * from './b';
import * from './someFile';
import * from './theme';
`);
  });

  it('creates reexport with relevant imports and exports', () => {
    generateReexport({
      config: [
        {
          folder: folderPath,
          importTemplate: ({ fileNameNoExt }) =>
            `import * as ${fileNameNoExt} from './${fileNameNoExt}';\n`,
          exportTemplate: ({ fileNamesNoExt }) =>
            `\nexport default { ${fileNamesNoExt.join(', ')} }\n`,
          fileNameTemplate: ({ folderName }) => `_${folderName}.ts`,
        },
      ],
    });

    const reexportFilePath = path.resolve(folderPath, '_reexportFolder.ts');

    const reexportContent = fs.readFileSync(reexportFilePath, fileEncoding);

    expect(reexportContent).to.equal(`import * as a from './a';
import * as b from './b';
import * as someFile from './someFile';
import * as theme from './theme';

export default { a, b, someFile, theme }
`);
  });

  it('creates reexport with filtered imports', () => {
    generateReexport({
      config: [
        {
          folder: folderPath,
          importTemplate: ({ fileNameNoExt }) => `import * from './${fileNameNoExt}';\n`,
          fileNameTemplate: ({ folderName }) => `_${folderName}.ts`,
          includeChildrenMask: /\.ts$/,
        },
      ],
    });

    const reexportFilePath = path.resolve(folderPath, '_reexportFolder.ts');

    const reexportContent = fs.readFileSync(reexportFilePath, fileEncoding);

    expect(reexportContent).to.equal(`import * from './a';
import * from './b';
`);
  });

  it('reexport when included in changedFiles', () => {
    generateReexport({
      config: [
        {
          folder: folderPath,
          importTemplate: ({ fileNameNoExt }) => `import * from './${fileNameNoExt}';\n`,
          fileNameTemplate: ({ folderName }) => `_${folderName}.ts`,
          includeChildrenMask: /\.ts$/,
        },
      ],
      changedFiles: [folderPath],
    });

    const reexportFilePath = path.resolve(folderPath, '_reexportFolder.ts');

    const reexportContent = fs.readFileSync(reexportFilePath, fileEncoding);

    expect(reexportContent).to.equal(`import * from './a';
import * from './b';
`);
  });

  it('no reexport when not included in changedFiles', () => {
    generateReexport({
      config: [
        {
          folder: folderPath,
          importTemplate: ({ fileNameNoExt }) => `import * from './${fileNameNoExt}';\n`,
          fileNameTemplate: ({ folderName }) => `_${folderName}.ts`,
          includeChildrenMask: /\.ts$/,
        },
      ],
      changedFiles: [],
    });

    const packageFilePath = path.resolve(folderPath, 'package.json');
    const reexportFilePath = path.resolve(folderPath, '_reexportFolder.ts');

    const packageExists = fs.existsSync(packageFilePath);
    const reexportExists = fs.existsSync(reexportFilePath);

    expect(packageExists).to.equal(false);
    expect(reexportExists).to.equal(false);
  });
});
