/**
 * @docs: https://eslint.org/docs/user-guide/configuring/language-options
 * @type {import("eslint").Linter.BaseConfig }
 *
 */

const path = require('path');

function getConfig(options) {
  const config = {
    env: { node: true, browser: true },
    parser: '@typescript-eslint/parser',
    extends: [path.resolve(__dirname, './rules.js'), 'prettier'],
    plugins: ['prettier', 'import', '@typescript-eslint'],
    settings: {
      'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
      'import/resolver': options.tsConfigPath
        ? {
            typescript: {
              alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
              project: options.tsConfigPath,
            },
          }
        : undefined,
    },
    parserOptions: { sourceType: 'module', ecmaVersion: 6 },

    // For TS files some other rules added
    overrides: options.tsConfigPath
      ? [
          {
            files: ['*.ts', '*.tsx'],
            extends: [path.resolve(__dirname, './rulesTs.js')],
            parserOptions: { project: [options.tsConfigPath] },
          },
        ]
      : undefined,
  };

  if (options.react) {
    config.plugins.unshift('react');
    config.extends.unshift(path.resolve(__dirname, './rulesReact.js'));
    config.settings.react = { pragma: 'React', version: 'detect' };
  }

  return config;
}

module.exports = getConfig;
