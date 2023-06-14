/**
 * @docs: https://eslint.org/docs/user-guide/configuring/language-options
 *
 */

const path = require('path');

const { getEslintConfig } = require('dk-eslint-config');

const eslintConfig = getEslintConfig({
  tsConfigPath: path.resolve(__dirname, './tsconfig.json'),
  react: true,
});

module.exports = eslintConfig;
