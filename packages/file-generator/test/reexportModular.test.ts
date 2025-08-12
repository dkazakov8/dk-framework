import fs from 'node:fs';
import path from 'node:path';

import { expect } from 'chai';
import fsExtra from 'fs-extra';

import { fileEncoding } from '../src/const';
import { ReexportModularGenerator } from '../src/plugins/reexport-modular';

describe('get sub folders or files', () => {
  let generator: ReexportModularGenerator;

  beforeEach(() => {
    generator = new ReexportModularGenerator({ config: [] });
  });

  const folder = path.resolve(__dirname, 'source/reexportModularFolder');

  it('successfully with folder', () => {
    const childrenPaths = generator.getFilteredChildren({ folder }).paths;

    const result = generator.getSubFoldersOrFiles({
      childrenPaths,
      childFileOrFolderName: 'someFolder',
    });

    expect(result).to.deep.equal([
      {
        moduleName: 'pageOne',
        subFolderOrFilePath: path.resolve(folder, 'pageOne/someFolder'),
      },
    ]);
  });

  it('successfully with file', () => {
    const childrenPaths = generator.getFilteredChildren({ folder }).paths;

    const result = generator.getSubFoldersOrFiles({
      childrenPaths,
      childFileOrFolderName: 'someFile.ts',
    });

    expect(result).to.deep.equal([
      {
        moduleName: 'pageTwo',
        subFolderOrFilePath: path.resolve(folder, 'pageTwo/someFile.ts'),
      },
    ]);
  });
});

describe('reexport modular', () => {
  let generator: ReexportModularGenerator;

  const folder = path.resolve(__dirname, 'source/reexportModularFolder');
  const targetFile = path.resolve(__dirname, 'tmp/modularFile.ts');

  beforeEach(() => {
    generator = new ReexportModularGenerator({ config: [] });
  });

  afterEach(() => {
    fsExtra.emptydirSync(path.resolve(__dirname, 'tmp'));
  });

  it('creates reexport', () => {
    generator = new ReexportModularGenerator({
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
    });

    generator.generate({ logs: true });

    const reexportExists = fs.existsSync(targetFile);
    const reexportContent = fs.readFileSync(targetFile, fileEncoding);

    expect(reexportExists).to.equal(true);
    expect(reexportContent).to.equal('// some-comment');
  });

  it('creates reexport with relevant imports (folder)', () => {
    generator = new ReexportModularGenerator({
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

    generator.generate({});

    const reexportContent = fs.readFileSync(targetFile, fileEncoding);

    expect(reexportContent).to.equal(`// some-comment

import * as pageOne from './../source/reexportModularFolder/pageOne/someFolder';

export default { pages: { pageOne } };
`);
  });

  it('creates reexport with relevant imports (file)', () => {
    generator = new ReexportModularGenerator({
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

    generator.generate({});

    const reexportContent = fs.readFileSync(targetFile, fileEncoding);

    expect(reexportContent).to.equal(`// some-comment

import pageTwo from './../source/reexportModularFolder/pageTwo/someFile';

export default { pages: { pageTwo } };
`);
  });

  it('reexport when included in changedFiles', () => {
    generator = new ReexportModularGenerator({
      config: [
        {
          folder,
          targetFile,
          childFileOrFolderName: '',
          exportTemplate: () => '',
          importTemplate: () => '',
        },
      ],
    });

    generator.generate({ changedFiles: [folder] });

    const reexportExists = fs.existsSync(targetFile);
    const reexportContent = fs.readFileSync(targetFile, fileEncoding);

    expect(reexportExists).to.equal(true);
    expect(reexportContent).to.equal('');
  });

  it('reexport when not included in changedFiles', () => {
    generator = new ReexportModularGenerator({
      config: [
        {
          folder,
          targetFile,
          childFileOrFolderName: '',
          exportTemplate: () => '',
          importTemplate: () => '',
        },
      ],
    });

    generator.generate({ changedFiles: [] });

    const reexportExists = fs.existsSync(targetFile);

    expect(reexportExists).to.equal(false);
  });

  it('reexport with filtered imports', () => {
    generator = new ReexportModularGenerator({
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

    generator.generate({});

    const reexportContent = fs.readFileSync(targetFile, fileEncoding);

    expect(reexportContent).to.equal(`// some-comment

import * as pageOne from './../source/reexportModularFolder/pageOne/someFolder';

export default { pages: { pageOne } };
`);
  });

  it('reexport with filtered imports2', () => {
    generator = new ReexportModularGenerator({
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

    generator.generate({});

    const reexportContent = fs.readFileSync(targetFile, fileEncoding);

    expect(reexportContent).to.equal(`
export default { pages: {  } };
`);
  });
});
