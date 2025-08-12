import fs from 'node:fs';
import path from 'node:path';

import fsExtra from 'fs-extra';

import { fileEncoding } from './const';
import { errors } from './errors';
import { TypeCommon, TypeFolderPath, TypeModifiedFiles } from './types';

export type TypeComparisonMatrix = Array<[number, number]>;

export abstract class BaseGenerator {
  /**
   * Generates files based on the provided configuration
   * This method must be implemented by all subclasses
   */
  abstract generate(common: TypeCommon): TypeModifiedFiles;

  /**
   * Checks if files exist and throws an error if they don't
   */
  checkFilesExistence({ paths }: { paths: Array<string> }): void {
    paths.forEach((filePath) => {
      if (!fs.existsSync(filePath)) throw new Error(`${errors.FILE_DOES_NOT_EXIST}: ${filePath}`);
    });
  }

  /**
   * Saves content to a file, but only if the content is different from what's already in the file
   */
  saveFile(params: {
    content: string;
    filePath: string;
    format?: (content: string) => string;
  }): boolean {
    const { content, filePath, format } = params;

    const contentFormatted = format ? format(content) : content;

    /**
     * Prevent file overwriting if content is the same
     */
    const oldFileContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, fileEncoding) : null;

    if (contentFormatted === oldFileContent) return false;

    fsExtra.outputFileSync(filePath, contentFormatted, fileEncoding);

    return true;
  }

  /**
   * Gets filtered children from a folder, excluding package.json and the reexport file,
   * and optionally filtering by a regex pattern
   */
  getFilteredChildren({
    folder,
    include,
    reexportFileName,
  }: {
    folder: TypeFolderPath;
    include?: RegExp;
    reexportFileName?: string;
  }) {
    const childrenFilenames = fs.readdirSync(folder);

    let filteredChildrenFilenames = childrenFilenames.filter(
      (fileName) => !['package.json', reexportFileName].includes(fileName)
    );

    if (include) {
      filteredChildrenFilenames = filteredChildrenFilenames.filter((fileName) =>
        include.test(fileName)
      );
    }

    /**
     * Sort file names alphabetically to avoid unnecessary rewrites
     */
    filteredChildrenFilenames.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    return {
      paths: filteredChildrenFilenames.map((fileName) => path.resolve(folder, fileName)),
      names: filteredChildrenFilenames,
    };
  }

  /**
   * Returns the symmetric difference between two arrays
   */
  arrayDifference(first: Array<string>, second: Array<string>): Array<string> {
    return first
      .filter((x) => !second.includes(x))
      .concat(second.filter((x) => !first.includes(x)));
  }

  /**
   * Generates a comparison matrix for an array
   */
  generateComparisonMatrix(arr: Array<any>): TypeComparisonMatrix {
    if (arr.length === 0) return [];
    if (arr.length === 1) return [[0, 0]];

    return arr.reduce((matrix, item, index) => {
      const nextIndexes = [];

      for (let nextIndex = index + 1; nextIndex < arr.length; nextIndex++) {
        nextIndexes.push(nextIndex);
      }

      nextIndexes.forEach((nextIndex) => matrix.push([index, nextIndex]));

      return matrix;
    }, [] as TypeComparisonMatrix);
  }

  /**
   * Calculates the time difference between two dates in seconds with a fixed precision
   */
  getTimeDelta(date1: number, date2: number) {
    const TIMING_PRECISION = 3;
    const MS_IN_SECOND = 1000;

    return ((date2 - date1) / MS_IN_SECOND).toFixed(TIMING_PRECISION);
  }
}
