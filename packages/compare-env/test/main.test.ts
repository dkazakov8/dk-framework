/* eslint-disable @typescript-eslint/no-magic-numbers */

import path from 'path';

import { expect } from 'chai';

import { errors } from '../src/errors';
import { compareEnvFiles } from '../src/compareEnvFiles';

describe('overall comparison', () => {
  it('successful', () => {
    const paths = [
      path.resolve(__dirname, 'envEqual/.env'),
      path.resolve(__dirname, 'envEqual/example.dev.env'),
      path.resolve(__dirname, 'envEqual/example.prod.env'),
    ];
    const parsedEnvKeys = ['PARAM_1', 'PARAM_2'];

    expect(() => compareEnvFiles({ paths, parsedEnvKeys })).to.not.throw();
  });

  it('successful without parsedEnvKeys', () => {
    const paths = [
      path.resolve(__dirname, 'envEqual/.env'),
      path.resolve(__dirname, 'envEqual/example.dev.env'),
      path.resolve(__dirname, 'envEqual/example.prod.env'),
    ];

    expect(() => compareEnvFiles({ paths })).to.not.throw();
  });

  it('successful with empty paths', () => {
    const paths: Array<string> = [];

    expect(() => compareEnvFiles({ paths })).to.not.throw();
  });

  it('with errors', () => {
    const paths = [
      path.resolve(__dirname, 'envNotEqual/.env'),
      path.resolve(__dirname, 'envNotEqual/example.dev.env'),
      path.resolve(__dirname, 'envNotEqual/example.prod.env'),
    ];
    const expectedError = `${errors.INTERSECTION_FAILED}: .env & example.dev.env have different keys: PARAM_1`;

    expect(() => compareEnvFiles({ paths })).to.throw(expectedError);
  });

  it('with errors parsedEnvKeys', () => {
    const paths = [
      path.resolve(__dirname, 'envEqual/.env'),
      path.resolve(__dirname, 'envEqual/example.dev.env'),
      path.resolve(__dirname, 'envEqual/example.prod.env'),
    ];
    const parsedEnvKeys = ['PARAM_1', 'PARAM_2', 'PARAM_3'];
    const expectedError = `${errors.PARSED_INTERSECTION_FAILED}: .env & parsedEnvKeys have different keys: PARAM_3`;

    expect(() => compareEnvFiles({ paths, parsedEnvKeys })).to.throw(expectedError);
  });

  it('with errors empty parsedEnvKeys', () => {
    const paths = [
      path.resolve(__dirname, 'envEqual/.env'),
      path.resolve(__dirname, 'envEqual/example.dev.env'),
      path.resolve(__dirname, 'envEqual/example.prod.env'),
    ];
    const parsedEnvKeys: Array<string> = [];
    const expectedError = `${errors.PARSED_INTERSECTION_FAILED}: .env & parsedEnvKeys have different keys: PARAM_1, PARAM_2`;

    expect(() => compareEnvFiles({ paths, parsedEnvKeys })).to.throw(expectedError);
  });

  it('with errors empty paths', () => {
    const paths: Array<string> = [];
    const parsedEnvKeys: Array<string> = ['PARAM_1'];
    const expectedError = `${errors.WRONG_INPUT}: paths are empty, but parsedEnvKeys is not. Pass some .env files`;

    expect(() => compareEnvFiles({ paths, parsedEnvKeys })).to.throw(expectedError);
  });
});
