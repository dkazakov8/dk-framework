/* eslint-disable @typescript-eslint/no-magic-numbers */

import path from 'path';
import fs from 'fs';

import fsExtra from 'fs-extra';
import { expect } from 'chai';

import { errors } from '../src/errors';
import { fileEncoding } from '../src/const';
import { saveFile } from '../src/utils/saveFile';
import { arrayDifference } from '../src/utils/arrayDifference';
import { checkFilesExistence } from '../src/utils/checkFilesExistence';
import { getFilteredChildren } from '../src/utils/getFilteredChildren';
import { generateComparisonMatrix } from '../src/utils/generateComparisonMatrix';

describe('difference between arrays', () => {
  it('has items', () => {
    const diff = arrayDifference(['a', 'b'], ['b', 'c', 'a']);

    expect(diff).to.deep.equal(['c']);
  });

  it('does not has items', () => {
    const diff = arrayDifference(['a', 'b'], ['b', 'a']);

    expect(diff).to.deep.equal([]);
  });

  it('does not has items on empty', () => {
    const diff = arrayDifference([], []);

    expect(diff).to.deep.equal([]);
  });
});

describe('generate comparison matrix', () => {
  const arrItem = {};

  it('from no elements', () => {
    expect(generateComparisonMatrix([])).to.deep.equal([]);
  });

  it('from one element', () => {
    expect(generateComparisonMatrix([arrItem])).to.deep.equal([[0, 0]]);
  });

  it('from two elements', () => {
    expect(generateComparisonMatrix([arrItem, arrItem])).to.deep.equal([[0, 1]]);
  });

  it('from three elements', () => {
    expect(generateComparisonMatrix([arrItem, arrItem, arrItem])).to.deep.equal([
      [0, 1],
      [0, 2],
      [1, 2],
    ]);
  });

  it('from four elements', () => {
    expect(generateComparisonMatrix([arrItem, arrItem, arrItem, arrItem])).to.deep.equal([
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ]);
  });

  it('from five elements', () => {
    expect(generateComparisonMatrix([arrItem, arrItem, arrItem, arrItem, arrItem])).to.deep.equal([
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 3],
      [2, 4],
      [3, 4],
    ]);
  });
});

describe('existence of files', () => {
  it('exists', () => {
    const existingPath = path.resolve(__dirname, 'source/someFile.txt');

    expect(() => checkFilesExistence({ paths: [existingPath] })).to.not.throw();
  });

  it('does not exist', () => {
    const existingPath = path.resolve(__dirname, 'source/someFile.txt');
    const notExistingPath = path.resolve(__dirname, 'someFile.ts');

    expect(() => checkFilesExistence({ paths: [existingPath, notExistingPath] })).to.throw(
      `${errors.FILE_DOES_NOT_EXIST}: ${notExistingPath}`
    );
  });
});

describe('file saving', () => {
  afterEach(() => {
    fsExtra.emptydirSync(path.resolve(__dirname, 'tmp'));
  });

  it('create new file', () => {
    const existingPath = path.resolve(__dirname, 'source/someFile.txt');
    const targetPath = path.resolve(__dirname, 'tmp/someFile.txt');

    const content = fs.readFileSync(existingPath, fileEncoding);

    const firstTry = saveFile({ content, filePath: targetPath });

    expect(firstTry).to.equal(true);

    const secondTry = saveFile({ content, filePath: targetPath });

    expect(secondTry).to.equal(false);

    const newContent = fs.readFileSync(targetPath, fileEncoding);

    expect(newContent).to.equal(content);
  });

  it('create new file deep folder', () => {
    const existingPath = path.resolve(__dirname, 'source/someFile.txt');
    const targetPath = path.resolve(__dirname, 'tmp/folder/another/someFile.txt');

    const content = fs.readFileSync(existingPath, fileEncoding);

    const firstTry = saveFile({ content, filePath: targetPath });

    expect(firstTry).to.equal(true);

    const secondTry = saveFile({ content, filePath: targetPath });

    expect(secondTry).to.equal(false);

    const newContent = fs.readFileSync(targetPath, fileEncoding);

    expect(newContent).to.equal(content);
  });
});

describe('get folder children files', () => {
  const folder = path.resolve(__dirname, 'source/reexportFolder');

  it('without filters (only package.json omitted)', () => {
    const fileNames = getFilteredChildren({ folder, reexportFileName: '' }).names;

    expect(fileNames).to.deep.equal(['a.ts', 'b.ts', 'someFile.txt', 'theme.scss']);
  });

  it('with reexport file filter', () => {
    const fileNames = getFilteredChildren({ folder, reexportFileName: 'a.ts' }).names;

    expect(fileNames).to.deep.equal(['b.ts', 'someFile.txt', 'theme.scss']);
  });

  it('with include file filter', () => {
    expect(
      getFilteredChildren({ folder, reexportFileName: '', include: /\.ts$/ }).names
    ).to.deep.equal(['a.ts', 'b.ts']);

    expect(
      getFilteredChildren({
        folder,
        reexportFileName: '',
        include: /\.(?!scss).*$/,
      }).names
    ).to.deep.equal(['a.ts', 'b.ts', 'someFile.txt']);

    expect(
      getFilteredChildren({
        folder,
        reexportFileName: 'a.ts',
        include: /^((?!theme).)*$/,
      }).names
    ).to.deep.equal(['b.ts', 'someFile.txt']);

    expect(
      getFilteredChildren({
        folder,
        reexportFileName: '',
        include: /^((?!file).)*$/i,
      }).names
    ).to.deep.equal(['a.ts', 'b.ts', 'theme.scss']);
  });
});
