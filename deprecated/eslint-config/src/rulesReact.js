/**
 * @docs: https://eslint.org/docs/rules/
 * @type { import("eslint/rules").ESLintRules }
 *
 * A click on a rule leads to TS docs
 *
 * Applied to TS & JS (mostly config) files. Rules intersecting with @typescript-eslint are excluded
 *
 */

const rulesConfig = {
  /**
   * @docs: https://github.com/yannickcr/eslint-plugin-react#list-of-supported-rules
   *
   * Actually no TS types available
   *
   */

  'react/no-typos': 'error',
  'react/no-set-state': 'error',
  'react/jsx-no-undef': 'error',
  'react/no-deprecated': 'error',
  'react/button-has-type': 'error',
  'react/no-unused-state': 'error',
  'react/no-children-prop': 'error',
  'react/no-find-dom-node': 'error',
  'react/jsx-handler-names': 'error',
  'react/no-unknown-property': 'error',
  'react/jsx-no-target-blank': 'error',
  'react/no-unused-prop-types': 'error',
  'react/require-render-return': 'error',
  'react/no-unescaped-entities': 'error',
  'react/jsx-no-duplicate-props': 'error',
  'react/jsx-no-useless-fragment': 'error',
  'react/jsx-no-comment-textnodes': 'error',
  'react/jsx-key': ['error', { checkFragmentShorthand: true }],
  'react/jsx-no-bind': ['error', { ignoreRefs: true, allowArrowFunctions: true }],
  'react/jsx-fragments': ['error', 'syntax'],
  'react/no-string-refs': ['error', { noTemplateLiterals: true }],
  'react/forbid-elements': ['error', { forbid: [{ element: 'button' }] }],
  'react/prefer-es6-class': ['error', 'always'],
  'react/jsx-boolean-value': ['error', 'never'],
  'react/self-closing-comp': ['error', { component: true, html: true }],
  'react/jsx-curly-brace-presence': ['error', { props: 'always', children: 'never' }],
  'react/function-component-definition': ['error', { namedComponents: 'arrow-function' }],
  'react/jsx-no-literals': [
    'error',
    { noStrings: true, ignoreProps: false, noAttributeStrings: true },
  ],
};

module.exports = {
  rules: rulesConfig,
};
