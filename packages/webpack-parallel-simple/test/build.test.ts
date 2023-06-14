/* eslint-disable @typescript-eslint/no-magic-numbers */

import path from 'path';
import fs from 'fs';

import fsExtra from 'fs-extra';
import { expect } from 'chai';

import { run, TypeConfig } from '../dist';

function handleBuild({
  ext,
  folder,
  configs,
  resolve,
}: {
  ext: string;
  folder: string;
  resolve: any;
  configs: Array<number>;
}) {
  const parallelConfig: TypeConfig = {
    bailOnError: true,
    configPaths: configs.map((num) =>
      path.resolve(__dirname, `./source/${folder}/config${num}${ext}`)
    ),
    afterFirstBuild: () => {
      configs.forEach((num) => {
        const text = fs.readFileSync(
          path.resolve(__dirname, `./tmp/entry${num}.bundle.js`),
          'utf-8'
        );
        expect(text).to.equal(`console.log(${num});`);
      });

      resolve(null);
    },
  };
  run(parallelConfig);
}

describe('build', () => {
  const tmpPath = path.resolve(__dirname, 'tmp');

  afterEach(() => {
    fsExtra.emptyDirSync(tmpPath);
  });

  it('js config and entries (1)', function test() {
    this.timeout(10000);

    const configs = [1];

    return new Promise((resolve) =>
      handleBuild({ configs, resolve, ext: '.js', folder: 'sampleJs' })
    );
  });

  it('js config and entries (2)', function test() {
    this.timeout(10000);

    const configs = [1, 2];

    return new Promise((resolve) =>
      handleBuild({ configs, resolve, ext: '.js', folder: 'sampleJs' })
    );
  });

  it('js config and entries (3)', function test() {
    this.timeout(10000);

    const configs = [1, 2, 3];

    return new Promise((resolve) =>
      handleBuild({ configs, resolve, ext: '.js', folder: 'sampleJs' })
    );
  });

  it('ts config and entries (1)', function test() {
    this.timeout(10000);

    const configs = [1];

    return new Promise((resolve) =>
      handleBuild({ configs, resolve, ext: '.ts', folder: 'sampleTs' })
    );
  });

  it('ts config and entries (2)', function test() {
    this.timeout(10000);

    const configs = [1, 2];

    return new Promise((resolve) =>
      handleBuild({ configs, resolve, ext: '.ts', folder: 'sampleTs' })
    );
  });

  it('ts config and entries (3)', function test() {
    this.timeout(10000);

    const configs = [1, 2, 3];

    return new Promise((resolve) =>
      handleBuild({ configs, resolve, ext: '.ts', folder: 'sampleTs' })
    );
  });
});
