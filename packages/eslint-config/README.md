## Enterprise-quality ESLint config with TypeScript support

[![npm](https://img.shields.io/npm/v/dk-eslint-config)](https://www.npmjs.com/package/dk-eslint-config)
[![license](https://img.shields.io/npm/l/dk-eslint-config)](https://github.com/dkazakov8/dk-eslint-config/blob/master/LICENSE)

Use as is or as an inspiration for your projects.

### Includes

- perfectly configured rules for JavaScript files with React
- perfectly configured rules for TypeScript files
- auto-formatting with Prettier integrated in ESLint (runs by `eslint --fix`)
- StyleLint rules for `*.scss` files

### Core concepts

- Syntax with async | generator | await | yield is restricted, use `// eslint-ignore` if you need this
- Max depth of blocks is 4, simplify your code by using function composition
- React is configured for using Class Components, so no long functions with mix of state, side-effects, lifecycle, markup are allowed
- `UNSAFE_componentWillMount` is allowed - this is a perfect solution for starting async actions that are executed in SSR
- Use `Type` | `Props` prefixes for types, `T` prefix for generics - no more confusion whether it is component, class or type
- Use camelCase for functions, UPPER_CASE for constants and PascalCase for types and classes
- Use `import _ from 'lodash'` with babel-plugin-lodash instead of `import ... from lodash/...`. No more `get(), merge()` without namespace
- Use dot object notation like `object.param` instead of `object['param']`
- No forgotten console statements
- Auto-sort imports
- Everything can be reconfigured in your own config

And many more best-practices. Recommended for use in scalable enterprise applications.

### Usage

1. Add `dk-eslint-config` to package.json
2. Create `.eslintrc.js` with content:
```javascript
const { getEslintConfig } = require('dk-eslint-config');

// When you need TypeScript
// const eslintConfig = getEslintConfig({ tsConfigPath: path.resolve(__dirname, './tsconfig.json'), react: true });

const eslintConfig = getEslintConfig({});

module.exports = eslintConfig;
```
3. Create `.stylelintrc.js` with content:
```javascript
const { stylelintConfig } = require('dk-eslint-config');

module.exports = stylelintConfig;
```
4. Create `.editorconfig` with content:
```editorconfig
[*]
max_line_length = 100
indent_style = space
indent_size = 2
```
5. Create `.formatignore` with content (maybe you need other folders like build or dist):
```ignore
node_modules
.yarn
cache
.cache
.vscode
```
6. Add scripts to package.json (example for formatting only pointed files but analyze all files):
```json
{
  "scripts": {
    "analyze:js": "eslint --ignore-path .formatignore --ext \".js,.ts,.tsx\" ./",
    "analyze:style": "stylelint --ignore-path .formatignore \"**/*.scss\"",
    "format:js": "eslint --ignore-path .formatignore --ext \".js,.ts,.tsx\" --fix",
    "format:style": "stylelint --ignore-path .formatignore --fix"
  }
}
```

Attach StyleLint and ESLint to your IDE, don't forget to enable auto-formatting on save.

It's recommended to add pre-commit hooks. For examples look through this repository. Example of usage:

1. Add `husky` (4.3.8 is cross-platform, higher versions are buggy) and `lint-staged` to `devDependencies`
2. Create `lint-staged.config.js` with content:
```javascript
const { lintStagedConfig } = require('dk-eslint-config');

module.exports = lintStagedConfig;
```
3. Add husky section to package.json:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "set -e&&lint-staged"
    }
  }
}
```

### Handling imports order

Sometimes you need to define custom groups for imports sorting. Here is an example of `.eslintrc.js`

```javascript
const fs = require('fs');
const path = require('path');

const { getEslintConfig } = require('dk-eslint-config');

const eslintConfig = getEslintConfig({
  react: true,
  tsConfigPath: path.resolve(__dirname, './tsconfig.json'),
});

/**
 * eslint-plugin-import considers all imports like './env.ts' | './paths.ts' as external
 *
 * but for better readability we need to treat them as internal to separate from
 * imports from 'node_modules' folder
 *
 */

const pathGroups = [
  { pattern: 'env', group: 'internal' },
  { pattern: 'paths', group: 'internal' },
];

/**
 * let's treat all files in ./src as internal (for ex. Webpack is configured with this alias)
 *
 */

fs.readdirSync(path.resolve(__dirname, 'src')).forEach((fileName) => {
  const fileNameNoExt = path.parse(fileName).name;

  pathGroups.push({ pattern: fileNameNoExt, group: 'internal' });
  pathGroups.push({ pattern: `${fileNameNoExt}/**`, group: 'internal' });
});

eslintConfig.rules = {
  'import/order': [
    'error',
    {
      'newlines-between': 'always',
      groups: ['builtin', 'external', 'internal', 'unknown', 'parent', 'sibling', 'index'],
      pathGroups,
      pathGroupsExcludedImportTypes: ['internal'],
    },
  ],
};

module.exports = eslintConfig;
```

