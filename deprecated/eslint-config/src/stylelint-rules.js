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
    'custom-property-empty-line-before': ['never'],
    'rule-empty-line-before': [
      'always-multi-line',
      { except: ['first-nested'], ignore: ['after-comment'] },
    ],
  },
};
