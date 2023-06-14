module.exports = {
  rules: {
    'at-rule-empty-line-before': [
      'always',
      {
        except: ['blockless-after-same-name-blockless', 'first-nested'],
        ignore: ['after-comment'],
      },
    ],
    'declaration-empty-line-before': ['never'],
    'declaration-block-semicolon-newline-after': ['always'],
    'at-rule-semicolon-newline-after': ['always'],
    'custom-property-empty-line-before': ['never'],
    'declaration-block-semicolon-newline-before': ['never-multi-line'],
    'max-empty-lines': 1,
    'no-empty-first-line': true,
    'rule-empty-line-before': [
      'always-multi-line',
      { except: ['first-nested'], ignore: ['after-comment'] },
    ],
  },
};
