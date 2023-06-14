import path from 'path';
import fs from 'fs';

import { expect } from 'chai';
import fsExtra from 'fs-extra';

import { errors } from '../src/errors';
import { fileEncoding } from '../src/const';
import { generateTheme } from '../src/plugins/theme';
import { convertCssToJs } from '../src/plugins/theme/convertCssToJs';
import { generateConfigs } from '../src/plugins/theme/generateConfigs';
import { compareByMatrix } from '../src/plugins/theme/compareByMatrix';
import { splitCssToThemeStrings } from '../src/plugins/theme/splitCssToThemeStrings';
import { generateComparisonMatrix } from '../src/utils/generateComparisonMatrix';

describe('convertCssToJs', () => {
  it('successful', () => {
    // Some badly formatted, but supported template
    const template = `
.light {
  --white: #fff;
  --black-param2: #000;
}


.dark2    {--white: #000;--black-param2: #fff;
}.semi-theme{
  --white: #aaa;
  --black-param2:    #ddd;}
    `;

    expect(convertCssToJs(template)).to.deep.equal({
      dark2: {
        '--white': '#000',
        '--black-param2': '#fff',
      },
      light: {
        '--white': '#fff',
        '--black-param2': '#000',
      },
      'semi-theme': {
        '--white': '#aaa',
        '--black-param2': '#ddd',
      },
    });
  });

  it('empty error', () => {
    const template = ``;
    const expectedError = `${errors.NO_THEME}: no a single theme found`;

    expect(() => convertCssToJs(template)).to.throw(expectedError);
  });

  it('incorrect theme name error', () => {
    const template = `.{}`;
    const expectedError = `${errors.NO_THEME_NAME}: not able to extract theme name. Check formatting in themes file`;

    expect(() => convertCssToJs(template)).to.throw(expectedError);
  });

  it('no variables error', () => {
    const template = `.light { margin-top: 14px; }`;
    const expectedError = `${errors.NO_THEME_VARIABLES}: not able to extract variables from theme light. Only --someparam syntax is supported`;

    expect(() => convertCssToJs(template)).to.throw(expectedError);
  });

  it('variable value error', () => {
    const template = `.light { --white: ; }`;
    const expectedError = `${errors.EMPTY_THEME_VARIABLE}: variable for --white is empty`;

    expect(() => convertCssToJs(template)).to.throw(expectedError);
  });
});

describe('compare theme configs', () => {
  it('successful', () => {
    const template = `
      .light {
        --white: #fff;
        --black-param2: #000;
      }
      
      .semi-theme {
        --white: #aaa;
        --black-param2: #ddd;
      }
    `;

    const themes = splitCssToThemeStrings({ template });
    const configs = generateConfigs({ themes });
    const matrix = generateComparisonMatrix(configs);

    expect(() => compareByMatrix({ configs, matrix })).to.not.throw();
  });

  it('with errors', () => {
    const template = `
      .light {
        --white: #fff;
        --black-param2: #000;
      }
      
      .semi-theme {
        --white: #aaa;
      }
    `;

    const themes = splitCssToThemeStrings({ template });
    const configs = generateConfigs({ themes });
    const matrix = generateComparisonMatrix(configs);

    const expectedError = `${errors.INTERSECTION_FAILED}: themes light & semi-theme have different keys: --black-param2`;

    expect(() => compareByMatrix({ configs, matrix })).to.throw(expectedError);
  });

  it('with errors2', () => {
    const template = `
      .light {
        --white: #fff;
        --black-param2: #000;
      }
      
      .dark {
        --white: #fff;
        --black-param2: #000;
      }
      
      .semi-theme {
        --white: #aaa;
        --black-param2: #000;
        --black: #000;
      }
    `;

    const themes = splitCssToThemeStrings({ template });
    const configs = generateConfigs({ themes });
    const matrix = generateComparisonMatrix(configs);

    const expectedError = `${errors.INTERSECTION_FAILED}: themes light & semi-theme have different keys: --black`;

    expect(() => compareByMatrix({ configs, matrix })).to.throw(expectedError);
  });
});

describe('generate theme', () => {
  afterEach(() => {
    fsExtra.emptydirSync(path.resolve(__dirname, 'tmp'));
  });

  it('with empty export template', () => {
    const file = path.resolve(__dirname, 'source/theme.scss');
    const targetFile = path.resolve(__dirname, 'tmp/theme.ts');

    generateTheme({
      config: [{ file, targetFile, exportTemplate: () => '' }],
    });

    const newContent = fs.readFileSync(targetFile, fileEncoding);

    expect(newContent).to.equal('');
  });

  it('with matching changed files', () => {
    const file = path.resolve(__dirname, 'source/theme.scss');
    const targetFile = path.resolve(__dirname, 'tmp/theme.ts');

    generateTheme({
      logs: true,
      config: [{ file, targetFile, exportTemplate: () => '' }],
      changedFiles: [file],
    });

    const newContent = fs.readFileSync(targetFile, fileEncoding);

    expect(newContent).to.equal('');
  });

  it('with empty changed files (no emit)', () => {
    const file = path.resolve(__dirname, 'source/theme.scss');
    const targetFile = path.resolve(__dirname, 'tmp/theme.ts');

    generateTheme({
      config: [{ file, targetFile, exportTemplate: () => '' }],
      changedFiles: [],
    });

    const fileExists = fs.existsSync(targetFile);

    expect(fileExists).to.equal(false);
  });

  it('with good export template', () => {
    const file = path.resolve(__dirname, 'source/theme.scss');
    const targetFile = path.resolve(__dirname, 'tmp/theme.ts');

    generateTheme({
      config: [
        {
          file,
          targetFile,
          exportTemplate: ({ targetFileNameNoExt, themes }) =>
            `/* eslint-disable */
// This file is auto-generated

export const ${targetFileNameNoExt} = ${JSON.stringify(themes, null, 2)}`,
        },
      ],
    });

    const newContent = fs.readFileSync(targetFile, fileEncoding);

    expect(newContent).to.equal(`/* eslint-disable */
// This file is auto-generated

export const theme = {
  "light": {
    "--white": "#fff",
    "--black-param2": "#000"
  },
  "semi-theme": {
    "--white": "#aaa",
    "--black-param2": "#ddd"
  }
}`);
  });

  it('error on fromPath not existing', () => {
    const file = path.resolve(__dirname, 'source/theme.scss2');
    const targetFile = path.resolve(__dirname, 'tmp/theme.ts');

    expect(() =>
      generateTheme({
        config: [{ file, targetFile, exportTemplate: () => `` }],
      })
    ).to.throw(`${errors.FILE_DOES_NOT_EXIST}: ${file}`);
  });
});
