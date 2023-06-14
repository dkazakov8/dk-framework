/**
 * @docs: https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
 * @type { import("eslint/rules").ESLintRules }
 *
 * Applied to TS files only
 *
 */

const rulesConfig = {
  '@typescript-eslint/no-shadow': 'error',
  '@typescript-eslint/no-namespace': 'error',
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/prefer-includes': 'error',
  '@typescript-eslint/prefer-as-const': 'error',
  '@typescript-eslint/no-empty-function': 'error',
  '@typescript-eslint/no-empty-interface': 'error',
  '@typescript-eslint/no-inferrable-types': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-array-constructor': 'error',
  //  '@typescript-eslint/no-non-null-assertion': 'off', // TEMP
  '@typescript-eslint/prefer-namespace-keyword': 'error',
  '@typescript-eslint/require-array-sort-compare': 'error',
  '@typescript-eslint/consistent-type-assertions': 'error',
  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/prefer-string-starts-ends-with': 'error',

  '@typescript-eslint/ban-types': ['error', { types: { '{}': false } }],
  '@typescript-eslint/array-type': ['error', { default: 'generic' }],
  '@typescript-eslint/no-magic-numbers': [
    'error',
    {
      ignoreTypeIndexes: true,
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true,
      ignoreNumericLiteralTypes: true,
      ignoreReadonlyClassProperties: true,
      ignore: [-1, 0, 1, 2],
    },
  ],
  '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'no-type-imports' }],
  '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
  '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
  '@typescript-eslint/naming-convention': [
    'error',
    {
      selector: 'default',
      format: ['camelCase', 'UPPER_CASE', 'snake_case'],
      filter: {
        regex: '^(UNSAFE_componentWillMount|__html|__filename|__dirname)$',
        match: false,
      },
    },
    {
      selector: 'typeLike',
      format: ['PascalCase'],
      prefix: ['Type', 'Props'],
    },
    {
      selector: 'typeParameter',
      format: ['PascalCase'],
      prefix: ['T'],
    },
    {
      selector: 'class',
      format: ['PascalCase'],
    },
  ],
};

module.exports = {
  rules: rulesConfig,
};
