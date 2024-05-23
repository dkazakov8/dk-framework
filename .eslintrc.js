/**
 * @docs: https://eslint.org/docs/user-guide/configuring/language-options
 *
 */

const path = require('path');

const { getEslintConfig } = require('./packages/eslint-config');

const eslintConfig = getEslintConfig({
  tsConfigPath: path.resolve(__dirname, './tsconfig.json'),
  react: true,
});

eslintConfig.overrides.push({
  files: ['*.ts', '*.tsx'],
  rules: { '@typescript-eslint/naming-convention': ['off'], 'react/jsx-no-literals': ['off'] },
});

module.exports = eslintConfig;
