/* eslint-disable @typescript-eslint/no-magic-numbers */

import fs from 'node:fs';
import path from 'node:path';

import { expect } from 'chai';
import fsExtra from 'fs-extra';

import { BaseGenerator } from '../src/BaseGenerator';
import { fileEncoding } from '../src/const';
import { errors } from '../src/errors';
import { TypeModifiedFiles } from '../src/types';

class TestBaseGenerator extends BaseGenerator {
  generate(): TypeModifiedFiles {
    return [];
  }
}

describe('BaseGenerator', () => {
  let baseGenerator: TestBaseGenerator;

  beforeEach(() => {
    baseGenerator = new TestBaseGenerator();
  });

  describe('arrayDifference', () => {
    it('has items', () => {
      const diff = baseGenerator.arrayDifference(['a', 'b'], ['b', 'c', 'a']);

      expect(diff).to.deep.equal(['c']);
    });

    it('does not has items', () => {
      const diff = baseGenerator.arrayDifference(['a', 'b'], ['b', 'a']);

      expect(diff).to.deep.equal([]);
    });

    it('does not has items on empty', () => {
      const diff = baseGenerator.arrayDifference([], []);

      expect(diff).to.deep.equal([]);
    });
  });

  describe('generateComparisonMatrix', () => {
    const arrItem = {};

    it('from no elements', () => {
      expect(baseGenerator.generateComparisonMatrix([])).to.deep.equal([]);
    });

    it('from one element', () => {
      expect(baseGenerator.generateComparisonMatrix([arrItem])).to.deep.equal([[0, 0]]);
    });

    it('from two elements', () => {
      expect(baseGenerator.generateComparisonMatrix([arrItem, arrItem])).to.deep.equal([[0, 1]]);
    });

    it('from three elements', () => {
      expect(baseGenerator.generateComparisonMatrix([arrItem, arrItem, arrItem])).to.deep.equal([
        [0, 1],
        [0, 2],
        [1, 2],
      ]);
    });

    it('from four elements', () => {
      expect(
        baseGenerator.generateComparisonMatrix([arrItem, arrItem, arrItem, arrItem])
      ).to.deep.equal([
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3],
      ]);
    });

    it('from five elements', () => {
      expect(
        baseGenerator.generateComparisonMatrix([arrItem, arrItem, arrItem, arrItem, arrItem])
      ).to.deep.equal([
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

  describe('checkFilesExistence', () => {
    it('exists', () => {
      const existingPath = path.resolve(__dirname, 'source/someFile.txt');

      expect(() => baseGenerator.checkFilesExistence({ paths: [existingPath] })).to.not.throw();
    });

    it('does not exist', () => {
      const existingPath = path.resolve(__dirname, 'source/someFile.txt');
      const notExistingPath = path.resolve(__dirname, 'someFile.ts');

      expect(() =>
        baseGenerator.checkFilesExistence({ paths: [existingPath, notExistingPath] })
      ).to.throw(`${errors.FILE_DOES_NOT_EXIST}: ${notExistingPath}`);
    });
  });

  describe('saveFile', () => {
    afterEach(() => {
      fsExtra.emptydirSync(path.resolve(__dirname, 'tmp'));
    });

    it('create new file', () => {
      const existingPath = path.resolve(__dirname, 'source/someFile.txt');
      const targetPath = path.resolve(__dirname, 'tmp/someFile.txt');

      const content = fs.readFileSync(existingPath, fileEncoding);

      const firstTry = baseGenerator.saveFile({ content, filePath: targetPath });

      expect(firstTry).to.equal(true);

      const secondTry = baseGenerator.saveFile({ content, filePath: targetPath });

      expect(secondTry).to.equal(false);

      const newContent = fs.readFileSync(targetPath, fileEncoding);

      expect(newContent).to.equal(content);
    });

    it('create new file deep folder', () => {
      const existingPath = path.resolve(__dirname, 'source/someFile.txt');
      const targetPath = path.resolve(__dirname, 'tmp/folder/another/someFile.txt');

      const content = fs.readFileSync(existingPath, fileEncoding);

      const firstTry = baseGenerator.saveFile({ content, filePath: targetPath });

      expect(firstTry).to.equal(true);

      const secondTry = baseGenerator.saveFile({ content, filePath: targetPath });

      expect(secondTry).to.equal(false);

      const newContent = fs.readFileSync(targetPath, fileEncoding);

      expect(newContent).to.equal(content);
    });
  });

  describe('getFilteredChildren', () => {
    const folder = path.resolve(__dirname, 'source/reexportFolder');

    it('without filters (only package.json omitted)', () => {
      const fileNames = baseGenerator.getFilteredChildren({
        folder,
        reexportFileName: '',
      }).names;

      expect(fileNames).to.deep.equal(['a.ts', 'b.ts', 'someFile.txt', 'theme.scss']);
    });

    it('with reexport file filter', () => {
      const fileNames = baseGenerator.getFilteredChildren({
        folder,
        reexportFileName: 'a.ts',
      }).names;

      expect(fileNames).to.deep.equal(['b.ts', 'someFile.txt', 'theme.scss']);
    });

    it('with include file filter', () => {
      expect(
        baseGenerator.getFilteredChildren({ folder, reexportFileName: '', include: /\.ts$/ }).names
      ).to.deep.equal(['a.ts', 'b.ts']);

      expect(
        baseGenerator.getFilteredChildren({
          folder,
          reexportFileName: '',
          include: /\.(?!scss).*$/,
        }).names
      ).to.deep.equal(['a.ts', 'b.ts', 'someFile.txt']);

      expect(
        baseGenerator.getFilteredChildren({
          folder,
          reexportFileName: 'a.ts',
          include: /^((?!theme).)*$/,
        }).names
      ).to.deep.equal(['b.ts', 'someFile.txt']);

      expect(
        baseGenerator.getFilteredChildren({
          folder,
          reexportFileName: '',
          include: /^((?!file).)*$/i,
        }).names
      ).to.deep.equal(['a.ts', 'b.ts', 'theme.scss']);
    });
  });

  describe('getTimeDelta', () => {
    it('calculates time difference correctly', () => {
      const date1 = 1000;
      const date2 = 2500;

      const result = baseGenerator.getTimeDelta(date1, date2);

      expect(result).to.equal('1.500');
    });

    it('handles zero difference', () => {
      const date = 1000;

      const result = baseGenerator.getTimeDelta(date, date);

      expect(result).to.equal('0.000');
    });
  });
});
