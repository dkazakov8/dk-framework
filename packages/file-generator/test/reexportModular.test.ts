import path from 'path';
import fs from 'fs';

import fsExtra from 'fs-extra';
import { expect } from 'chai';

import { getFilteredChildren } from '../src/utils/getFilteredChildren';
import { getSubFoldersOrFiles } from '../src/plugins/reexport-modular/getSubFoldersOrFiles';
import { generateReexportModular } from '../src/plugins/reexport-modular';
import { fileEncoding } from '../src/const';

describe('get sub folders or files', () => {
  const folder = path.resolve(__dirname, 'source/reexportModularFolder');

  it('successfully with folder', () => {
    const childrenPaths = getFilteredChildren({ folder }).paths;

    const result = getSubFoldersOrFiles({ childrenPaths, childFileOrFolderName: 'someFolder' });

    expect(result).to.deep.equal([
      {
        moduleName: 'pageOne',
        subFolderOrFilePath: path.resolve(folder, 'pageOne/someFolder'),
      },
    ]);
  });

  it('successfully with file', () => {
    const childrenPaths = getFilteredChildren({ folder }).paths;

    const result = getSubFoldersOrFiles({ childrenPaths, childFileOrFolderName: 'someFile.ts' });

    expect(result).to.deep.equal([
      {
        moduleName: 'pageTwo',
        subFolderOrFilePath: path.resolve(folder, 'pageTwo/someFile.ts'),
      },
    ]);
  });
});

describe('reexport modular', () => {
  const folder = path.resolve(__dirname, 'source/reexportModularFolder');
  const targetFile = path.resolve(__dirname, 'tmp/modularFile.ts');

  afterEach(() => {
    fsExtra.emptydirSync(path.resolve(__dirname, 'tmp'));
  });

  it('creates reexport', () => {
    generateReexportModular({
      config: [
        {
          folder,
          targetFile,
          childFileOrFolderName: 'someFolder',
          exportTemplate: () => '',
          importTemplate: () => '',
          headerTemplate: '// some-comment',
        },
      ],
      logs: true,
    });

    const reexportExists = fs.existsSync(targetFile);

    const reexportContent = fs.readFileSync(targetFile, fileEncoding);

    expect(reexportExists).to.equal(true);
    expect(reexportContent).to.equal('// some-comment');
  });

  it('creates reexport with relevant imports (folder)', () => {
    generateReexportModular({
      config: [
        {
          folder,
          targetFile,
          childFileOrFolderName: 'someFolder',
          exportTemplate: ({ subFoldersOfFiles }) =>
            `\nexport default { pages: { ${subFoldersOfFiles
              .map(({ moduleName }) => moduleName)
              .join(', ')} } };\n`,
          importTemplate: ({ moduleName, relativePath }) =>
            `import * as ${moduleName} from './${relativePath}';\n`,
          headerTemplate: '// some-comment\n\n',
        },
      ],
    });

    const reexportContent = fs.readFileSync(targetFile, fileEncoding);

    expect(reexportContent).to.equal(`// some-comment

import * as pageOne from './../source/reexportModularFolder/pageOne/someFolder';

export default { pages: { pageOne } };
`);
  });

  it('creates reexport with relevant imports (file)', () => {
    generateReexportModular({
      config: [
        {
          folder,
          targetFile,
          childFileOrFolderName: 'someFile.ts',
          exportTemplate: ({ subFoldersOfFiles }) =>
            `\nexport default { pages: { ${subFoldersOfFiles
              .map(({ moduleName }) => moduleName)
              .join(', ')} } };\n`,
          importTemplate: ({ moduleName, relativePath }) =>
            `import ${moduleName} from './${relativePath}';\n`,
          headerTemplate: '// some-comment\n\n',
        },
      ],
    });

    const reexportContent = fs.readFileSync(targetFile, fileEncoding);

    expect(reexportContent).to.equal(`// some-comment

import pageTwo from './../source/reexportModularFolder/pageTwo/someFile';

export default { pages: { pageTwo } };
`);
  });

  it('reexport when included in changedFiles', () => {
    generateReexportModular({
      config: [
        {
          folder,
          targetFile,
          childFileOrFolderName: '',
          exportTemplate: () => '',
          importTemplate: () => '',
        },
      ],
      changedFiles: [folder],
    });

    const reexportExists = fs.existsSync(targetFile);

    const reexportContent = fs.readFileSync(targetFile, fileEncoding);

    expect(reexportExists).to.equal(true);
    expect(reexportContent).to.equal('');
  });

  it('reexport when not included in changedFiles', () => {
    generateReexportModular({
      config: [
        {
          folder,
          targetFile,
          childFileOrFolderName: '',
          exportTemplate: () => '',
          importTemplate: () => '',
        },
      ],
      changedFiles: [],
    });

    const reexportExists = fs.existsSync(targetFile);

    expect(reexportExists).to.equal(false);
  });

  it('reexport with filtered imports', () => {
    generateReexportModular({
      config: [
        {
          folder,
          targetFile,
          childFileOrFolderName: 'someFolder',
          exportTemplate: ({ subFoldersOfFiles }) =>
            `\nexport default { pages: { ${subFoldersOfFiles
              .map(({ moduleName }) => moduleName)
              .join(', ')} } };\n`,
          importTemplate: ({ moduleName, relativePath }) =>
            `import * as ${moduleName} from './${relativePath}';\n`,
          headerTemplate: '// some-comment\n\n',
          includeChildrenMask: /pageOne$/,
        },
      ],
    });

    const reexportContent = fs.readFileSync(targetFile, fileEncoding);

    expect(reexportContent).to.equal(`// some-comment

import * as pageOne from './../source/reexportModularFolder/pageOne/someFolder';

export default { pages: { pageOne } };
`);
  });

  it('reexport with filtered imports2', () => {
    generateReexportModular({
      config: [
        {
          folder,
          targetFile,
          childFileOrFolderName: 'someFolder',
          exportTemplate: ({ subFoldersOfFiles }) =>
            `\nexport default { pages: { ${subFoldersOfFiles
              .map(({ moduleName }) => moduleName)
              .join(', ')} } };\n`,
          importTemplate: ({ moduleName, relativePath }) =>
            `import * as ${moduleName} from './${relativePath}';\n`,
          includeChildrenMask: /pageTwo$/,
        },
      ],
    });

    const reexportContent = fs.readFileSync(targetFile, fileEncoding);

    expect(reexportContent).to.equal(`
export default { pages: {  } };
`);
  });
});
