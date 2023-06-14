/* eslint-disable @typescript-eslint/no-magic-numbers */

import path from 'path';

import { expect } from 'chai';

import { errors } from '../src/errors';
import { arrayDifference } from '../src/arrayDifference';
import { compareEnvByMatrix } from '../src/compareEnvByMatrix';
import { checkFilesExistence } from '../src/checkFilesExistence';
import { generateConfigFromEnv } from '../src/generateConfigFromEnv';
import { compareParsed } from '../src/compareParsed';
import { generateComparisonMatrix } from '../src/generateComparisonMatrix';

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

describe('existence of files', () => {
  it('exists', () => {
    const existingPath = path.resolve(__dirname, 'envEqual/.env');

    expect(() => checkFilesExistence({ paths: [existingPath] })).to.not.throw();
  });

  it('does not exist', () => {
    const existingPath = path.resolve(__dirname, 'envEqual/.env');
    const notExistingPath = path.resolve(__dirname, 'envEqual/.env2');

    expect(() => checkFilesExistence({ paths: [existingPath, notExistingPath] })).to.throw(
      `${errors.FILE_DOES_NOT_EXIST}: ${notExistingPath}`
    );
  });
});

describe('parsing', () => {
  it('correctly gets file names and params', () => {
    expect(
      generateConfigFromEnv({
        paths: [
          path.resolve(__dirname, 'envEqual/.env'),
          path.resolve(__dirname, 'envEqual/example.dev.env'),
          path.resolve(__dirname, 'envEqual/example.prod.env'),
        ],
      })
    ).to.deep.equal([
      {
        keys: ['PARAM_1', 'PARAM_2'],
        fileName: '.env',
        envAsObject: { PARAM_1: 'param-1-value', PARAM_2: '1' },
      },
      {
        keys: ['PARAM_1', 'PARAM_2'],
        fileName: 'example.dev.env',
        envAsObject: { PARAM_1: 'param-1-value', PARAM_2: '2' },
      },
      {
        keys: ['PARAM_1', 'PARAM_2'],
        fileName: 'example.prod.env',
        envAsObject: { PARAM_1: 'param-1-value', PARAM_2: '3' },
      },
    ]);
  });
});

describe('generate comparison matrix', () => {
  const configSample = {
    keys: ['PARAM_1', 'PARAM_2'],
    fileName: '.env',
    envAsObject: { PARAM_1: 'param-1-value', PARAM_2: '1' },
  };

  it('from no elements', () => {
    expect(
      generateComparisonMatrix({
        envConfigs: [],
      })
    ).to.deep.equal([]);
  });

  it('from one element', () => {
    expect(
      generateComparisonMatrix({
        envConfigs: [configSample],
      })
    ).to.deep.equal([[0, 0]]);
  });

  it('from two elements', () => {
    expect(
      generateComparisonMatrix({
        envConfigs: [configSample, configSample],
      })
    ).to.deep.equal([[0, 1]]);
  });

  it('from three elements', () => {
    expect(
      generateComparisonMatrix({
        envConfigs: [configSample, configSample, configSample],
      })
    ).to.deep.equal([
      [0, 1],
      [0, 2],
      [1, 2],
    ]);
  });

  it('from four elements', () => {
    expect(
      generateComparisonMatrix({
        envConfigs: [configSample, configSample, configSample, configSample],
      })
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
      generateComparisonMatrix({
        envConfigs: [configSample, configSample, configSample, configSample, configSample],
      })
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

describe('compare env configs', () => {
  it('successful', () => {
    const envConfigs = generateConfigFromEnv({
      paths: [
        path.resolve(__dirname, 'envEqual/.env'),
        path.resolve(__dirname, 'envEqual/example.dev.env'),
        path.resolve(__dirname, 'envEqual/example.prod.env'),
      ],
    });
    const matrix = generateComparisonMatrix({ envConfigs });

    expect(() => compareEnvByMatrix({ envConfigs, matrix })).to.not.throw();
  });

  it('with errors', () => {
    const envConfigs = generateConfigFromEnv({
      paths: [
        path.resolve(__dirname, 'envNotEqual/.env'),
        path.resolve(__dirname, 'envNotEqual/example.dev.env'),
        path.resolve(__dirname, 'envNotEqual/example.prod.env'),
      ],
    });
    const matrix = generateComparisonMatrix({ envConfigs });
    const expectedError = `${errors.INTERSECTION_FAILED}: .env & example.dev.env have different keys: PARAM_1`;

    expect(() => compareEnvByMatrix({ envConfigs, matrix })).to.throw(expectedError);
  });

  it('with errors2', () => {
    const envConfigs = generateConfigFromEnv({
      paths: [
        path.resolve(__dirname, 'envNotEqual2/.env'),
        path.resolve(__dirname, 'envNotEqual2/example.dev.env'),
        path.resolve(__dirname, 'envNotEqual2/example.prod.env'),
      ],
    });
    const matrix = generateComparisonMatrix({ envConfigs });
    const expectedError = `${errors.INTERSECTION_FAILED}: .env & example.prod.env have different keys: PARAM_1, PARAM_2`;

    expect(() => compareEnvByMatrix({ envConfigs, matrix })).to.throw(expectedError);
  });
});

describe('compare env configs with parsed', () => {
  it('successful', () => {
    const envConfigs = generateConfigFromEnv({
      paths: [
        path.resolve(__dirname, 'envEqual/.env'),
        path.resolve(__dirname, 'envEqual/example.dev.env'),
        path.resolve(__dirname, 'envEqual/example.prod.env'),
      ],
    });
    const parsedEnvKeys = ['PARAM_1', 'PARAM_2'];

    expect(() => compareParsed({ envConfigs, parsedEnvKeys })).to.not.throw();
  });

  it('with errors', () => {
    const envConfigs = generateConfigFromEnv({
      paths: [
        path.resolve(__dirname, 'envEqual/.env'),
        path.resolve(__dirname, 'envEqual/example.dev.env'),
        path.resolve(__dirname, 'envEqual/example.prod.env'),
      ],
    });
    const parsedEnvKeys = ['PARAM_1'];
    const expectedError = `${errors.PARSED_INTERSECTION_FAILED}: .env & parsedEnvKeys have different keys: PARAM_2`;

    expect(() => compareParsed({ envConfigs, parsedEnvKeys })).to.throw(expectedError);
  });

  it('with errors2', () => {
    const envConfigs = generateConfigFromEnv({
      paths: [
        path.resolve(__dirname, 'envEqual/.env'),
        path.resolve(__dirname, 'envEqual/example.dev.env'),
        path.resolve(__dirname, 'envEqual/example.prod.env'),
      ],
    });
    const parsedEnvKeys: Array<string> = [];
    const expectedError = `${errors.PARSED_INTERSECTION_FAILED}: .env & parsedEnvKeys have different keys: PARAM_1, PARAM_2`;

    expect(() => compareParsed({ envConfigs, parsedEnvKeys })).to.throw(expectedError);
  });

  it('with errors3', () => {
    const envConfigs = generateConfigFromEnv({
      paths: [path.resolve(__dirname, 'envNotEqual/.env')],
    });
    const parsedEnvKeys = ['PARAM_1', 'PARAM_2'];
    const expectedError = `${errors.PARSED_INTERSECTION_FAILED}: .env & parsedEnvKeys have different keys: PARAM_1`;

    expect(() => compareParsed({ envConfigs, parsedEnvKeys })).to.throw(expectedError);
  });

  it('with errors4', () => {
    const envConfigs = generateConfigFromEnv({
      paths: [
        path.resolve(__dirname, 'envEqual/.env'),
        path.resolve(__dirname, 'envNotEqual2/example.prod.env'),
      ],
    });
    const parsedEnvKeys = ['PARAM_1', 'PARAM_2'];
    const expectedError = `${errors.PARSED_INTERSECTION_FAILED}: example.prod.env & parsedEnvKeys have different keys: PARAM_1, PARAM_2`;

    expect(() => compareParsed({ envConfigs, parsedEnvKeys })).to.throw(expectedError);
  });
});
