## Creates reexport files

[![coverage](https://img.shields.io/codecov/c/gh/dkazakov8/dk-file-generator/master)](https://codecov.io/gh/dkazakov8/dk-file-generator)
[![npm](https://img.shields.io/npm/v/dk-file-generator)](https://www.npmjs.com/package/dk-file-generator)
[![license](https://img.shields.io/npm/l/dk-file-generator)](https://github.com/dkazakov8/dk-file-generator/blob/master/LICENSE)

This library is a powerful helper for Front-End developers that leverages a lot of manual work.
Thoroughly tested and nicely optimized, successfully used in medium and large scale Enterprise projects 
with a huge amount of plugins' configs.

Through plugins it can create:
- js (ts) files from .css theme files
- reexport files (and modular reexport files) with corresponding package.json
- js realtime validators from TypeScript models

Also it can watch your filesystem and recreate files on fly.

- [Installation](#installation)
- [Plugin: theme](#plugin-theme)
- [Plugin: reexport](#plugin-reexport)
- [Plugin: reexport-modular](#plugin-reexport-modular)
- [Plugin: validators](#plugin-validators)
- [Include and exclude files](#include-and-exclude-files)

### Installation

1. Add `dk-file-generator` to package.json and install
2. Execute overall generation before build (create some file and execute via `node` or add to your current build file)
```typescript
import { generateFiles } from 'dk-file-generator';

generateFiles({
  configs: [],
  timeLogs: true,
  timeLogsOverall: true,
  fileModificationLogs: true,

  // If you use watch mode for local development
  watch: {
    paths: [path.resolve(__dirname, 'src')],
    changedFilesLogs: true,
    aggregationTimeout: 500,
  }
});
```

`generateFiles` works synchronously. Basic installation is complete, use plugins to add some functionality.

### Plugin: theme

When work with CSS variables for theming, you need some JS implementation to apply them to `<html>` tag.
This plugin helps to create corresponding js/ts file.

For example, you got file `src/styles/theme.scss`:

```scss
.light {
  --white: #fff;
  --black-param: #000;
}

.dark {
  --white: #aaa;
  --black-param: #ddd;
}
```

and want to create `src/const/theme.ts`:

```typescript
/* eslint-disable */
// This file is auto-generated

export const theme = {
  "light": {
    "--white": "#fff",
    "--black-param": "#000"
  },
  "dark": {
    "--white": "#aaa",
    "--black-param": "#ddd"
  }
}
```

Use this recipe:

```typescript
import { TypeGenerateFilesParams } from 'dk-file-generator';

const headerTemplate = `/* eslint-disable */\n// This file is auto-generated\n\n`;

const configs: TypeGenerateFilesParams['configs'] = [
  {
    plugin: 'theme',
    config: [
      {
        file: path.resolve(__dirname, 'src/styles/theme.scss'),
        targetFile: path.resolve(__dirname, 'src/const/theme.ts'),
        exportTemplate: ({ targetFileNameNoExt, themes }) =>
          `${headerTemplate}${targetFileNameNoExt} = ${JSON.stringify(themes, null, 2)}`,
      },
    ],
  }
]
```
> It is recommended to disable ESLint with a comment for generated files, so they could be consistent
across all developers and CI

Then you will need just include this theme into html markup like this

```typescript
import { theme } from 'src/const/theme';

function setThemeToHTML(themeParams: Record<string, string>) {
  const root = document.documentElement;

  Object.entries(themeParams).forEach(([cssVar, cssVarValue]) => {
    root.style.setProperty(cssVar, cssVarValue);
  });
}

setThemeToHTML(theme.light)
```

Also you could use `theme.ts` in you code for mappings, inline style variables and SSR.

Features:
- ensures that every theme has the same CSS variables
- not CSS variables (like `margin-top`, `height` etc.) are ignored
- no file rewritings when content is the same

Params:
- `file` absolute path to css file
- `targetFile` absolute path to target file (choose extension as you like)
- `exportTemplate({ targetFileNameNoExt, themes })`

`targetFileNameNoExt` - target file name without extension

`themes`: `Record<TypeThemeName, Record<TypeVariableName, TypeVariableValue>>` - js object that represents themes

returns `string`


### Plugin: reexport

Reads folder content and creates `someReexportFile.ts(.js)` and `package.json` in that folder.
Highly customizable.

1. Typical scenario. You have folder `src/utils`
```
utils /
-- fileOne.ts
-- fileTwo.ts
```

and want to import their content from one place like

```typescript
import { fnFromFileOne, fnFromFileTwo } from 'src/utils';
```

Use this recipe:

```typescript
import { TypeGenerateFilesParams } from 'dk-file-generator';

const headerTemplate = `/* eslint-disable */\n// This file is auto-generated\n\n`;

const configs: TypeGenerateFilesParams['configs'] = [
  {
    plugin: 'reexport',
    config: [
      {
        folder: path.resolve(__dirname, 'src/utils'),
        importTemplate: ({ fileNameNoExt }) => `export * from './${fileNameNoExt}';\n`,
        fileNameTemplate: ({ folderName }) => `_${folderName}.ts`,
        headerTemplate,
      },
    ],
  }
]
```

it creates a file `src/utils/_utils.ts`

```typescript
/* eslint-disable */
// This file is auto-generated

export * from './fileOne';
export * from './fileTwo';
```

and `src/utils/package.json`

```json
{
  "main": "_utils.ts",
  "types": "_utils.ts"
}
```

In need of a deep reexport of folders just add corresponding configs (children first)

```
utils /
-- folderOne
---- fileOne.ts
---- fileTwo.ts
-- folderTwo
---- fileOne.ts
---- fileTwo.ts
```

```typescript
import { TypeGenerateFilesParams } from 'dk-file-generator';

const headerTemplate = `/* eslint-disable */\n// This file is auto-generated\n\n`;

const configs: TypeGenerateFilesParams['configs'] = [
  {
    plugin: 'reexport',
    config: [
      {
        folder: path.resolve(__dirname, 'src/utils/folderOne'),
        importTemplate: ({ fileNameNoExt }) => `export * from './${fileNameNoExt}';\n`,
        fileNameTemplate: ({ folderName }) => `_${folderName}.ts`,
        headerTemplate,
      },
      {
        folder: path.resolve(__dirname, 'src/utils/folderTwo'),
        importTemplate: ({ fileNameNoExt }) => `export * from './${fileNameNoExt}';\n`,
        fileNameTemplate: ({ folderName }) => `_${folderName}.ts`,
        headerTemplate,
      },
      {
        folder: path.resolve(__dirname, 'src/utils'),
        importTemplate: ({ fileNameNoExt }) => `export * from './${fileNameNoExt}';\n`,
        fileNameTemplate: ({ folderName }) => `_${folderName}.ts`,
        headerTemplate,
      },
    ],
  }
]
```

So all functions from children files could be imported like `import { someFn } from 'src/utils'`.

2. Typical scenario when need to reexport default exports

```typescript
import { TypeGenerateFilesParams } from 'dk-file-generator';

const headerTemplate = `/* eslint-disable */\n// This file is auto-generated\n\n`;

const configs: TypeGenerateFilesParams['configs'] = [
  {
    plugin: 'reexport',
    config: [
      {
        folder: path.resolve(__dirname, 'src/utils'),
        importTemplate: ({ fileNameNoExt }) => `export { default as ${fileNameNoExt} } from './${fileNameNoExt}';\n`,
        fileNameTemplate: () => `_customReexportFileName.ts`,
        headerTemplate,
      },
    ],
  }
]
```

it creates a file `src/utils/_customReexportFileName.ts` and `src/utils/package.json`

```typescript
/* eslint-disable */
// This file is auto-generated

export { default as fileOne } from './fileOne';
export { default as fileTwo } from './fileTwo';
```

3. Export as object (example with icons)

```
icons /
-- iconOne.svg
-- iconTwo.svg
```

```typescript
import { TypeGenerateFilesParams } from 'dk-file-generator';

const headerTemplate = `/* eslint-disable */\n// This file is auto-generated\n\n`;

const configs: TypeGenerateFilesParams['configs'] = [
  {
    plugin: 'reexport',
    config: [
      {
        folder: path.resolve(__dirname, 'src/icons'),
        importTemplate: ({ fileNameNoExt, fileName }) =>
          `import ${fileNameNoExt} from './${fileName}';\n`,
        exportTemplate: ({ fileNamesNoExt, folderName }) =>
          `\nexport const ${folderName} = { ${fileNamesNoExt.join(', ')} }`,
        fileNameTemplate: ({ folderName }) => `_${folderName}.ts`,
        headerTemplate,
      },
    ],
  }
]
```

it creates a file `src/icons/_icons.ts` and `src/icons/package.json`

```typescript
/* eslint-disable */
// This file is auto-generated

import iconOne from './iconOne.svg';
import iconTwo from './iconTwo.svg';

export const icons = { iconOne, iconTwo };
```

Features:
- `package.json` and reexport file are excluded by default during reading folder content, so no
cycle imports occur
- file names are passed "as-is", so it's better to name them in `camelCase` or `snake_case`, because
names like `some-file-name` cannot be keys of JS object without parentheses. You can still use it,
but tune you reexport config accordingly

> When reexport file is used, constants' and functions' names in children files must not be the same!
> Just some obvious warning.

Params:
- `folder` absolute path to folder
- `headerTemplate` (optional) some text in the beginning of the file
- `includeChildrenMask` (optional) look at [this section](#include-and-exclude-files)
- `importTemplate({ fileNameNoExt, fileName })`

`fileNameNoExt` - child file name without extension

`fileName` - child file name with extension

returns `string`

- `fileNameTemplate({ folderName })`

`folderName` - folder name

returns `string`

- `exportTemplate({ fileNamesNoExt, folderName })` (optional)

`fileNamesNoExt` - array of children files' names without extension

`folderName` - folder name

returns `string`


### Plugin: reexport-modular

Deep reads folder children and creates `someReexportFile.ts(.js)`.

For example, you have modular structure of pages and want to extract types from every modular store.

```
pages /
-- pageOne
---- store.ts
-- pageTwo
---- store.ts
-- pageThree
---- noStore.ts
```

Use this recipe:

```typescript
import { TypeGenerateFilesParams } from 'dk-file-generator';

const headerTemplate = `/* eslint-disable */\n// This file is auto-generated\n\n`;

const configs: TypeGenerateFilesParams['configs'] = [
  {
    plugin: 'reexport-modular',
    config: [
      {
        folder: path.resolve(__dirname, 'src/pages'),
        targetFile: path.resolve(__dirname, 'modularStores.ts'),
        childFileOrFolderName: 'store.ts',
        exportTemplate: ({ subFoldersOfFiles }) =>
          `\nexport default { pages: { ${subFoldersOfFiles
            .map(({ moduleName }) => moduleName)
            .join(', ')} } };`,
        importTemplate: ({ moduleName, relativePath }) =>
          `import * as ${moduleName} from './${relativePath}';\n`,
        headerTemplate,
      },
    ],
  }
]
```

it creates a file `src/modularStores.ts`

```typescript
/* eslint-disable */
// This file is auto-generated

import pageOne from './pages/pageOne/store';
import pageTwo from './pages/pageTwo/store';

export default { pages: { pageOne, pageTwo } };
```

as you can see `pageThree` is not exported because it has no `store.ts` file.

Params:
- `folder` absolute path to folder
- `targetFile` absolute path to target reexport file
- `childFileOrFolderName` file name (with extension) or folder name
- `headerTemplate` (optional) some text in the beginning of the file
- `includeChildrenMask` (optional) look at [this section](#include-and-exclude-files)
- `importTemplate({ moduleName, relativePath })`

`moduleName` - first-level page name

`relativePath` - relative path from `targetFile` to `childFileOrFolderName`

returns `string`

- `exportTemplate({ subFoldersOfFiles })`

`subFoldersOfFiles` - array of `{ subFolderOrFilePath: string; moduleName: string }`

returns `string`


### Plugin: validators

Converts files in folder to validators using customized version of [ts-interface-builder](https://github.com/gristlabs/ts-interface-builder),
that can be used by [ts-interface-checker](https://github.com/gristlabs/ts-interface-checker).

```
api /
-- getUser.ts
models /
-- TypeUser.ts
```

where `api/getUser.ts`

```typescript
import { TypeUser } from '../models/TypeUser';

type TypeRequest = {};

type TypeResponse = TypeUser;

export const getUser: {
  url: string;
  request: TypeRequest;
  response: TypeResponse;
} = {
  url: `/api/user`,
  request: {} as TypeRequest,
  response: {} as TypeResponse,
};
```

and `models/TypeUser.ts`

```typescript
export type TypeUser = {
  email: string;
  name: string;
  someData: Array<[number, string]>;
};
```

Use this recipe:

```typescript
import { TypeGenerateFilesParams } from 'dk-file-generator';

const headerTemplate = `/* eslint-disable */\n// This file is auto-generated\n\n`;

// Example of reuse compilerOptions from tsconfig.json, but you can pass custom rules
const { compilerOptions } = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'tsconfig.json'), 'utf-8')
);

const configs: TypeGenerateFilesParams['configs'] = [
  {
    plugin: 'validators',
    config: [
      {
        folder: path.resolve(__dirname, 'src/api'),
        targetFolder: path.resolve(__dirname, 'src/validators'),
        triggerFolder: path.resolve(__dirname, 'src/models'),
        headerTemplate,
        compilerOptions,
      },
    ],
  }
]
```

it creates a file `src/validators/getUser.ts`

```typescript
/* eslint-disable */
// This file is auto-generated

import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const TypeUser = t.iface([], {
  "email": "string",
  "name": "string",
  "someData": t.array(t.tuple("number", "string")),
});

export const TypeRequest = t.iface([], {
});

export const TypeResponse = t.name("TypeUser");

const exportedTypeSuite: t.ITypeSuite = {
  TypeUser,
  TypeRequest,
  TypeResponse,
};
export default exportedTypeSuite;
```

Params:
- `folder` absolute path to folder
- `targetFolder` absolute path to target folder
- `triggerFolder` (optional) absolute path to folder from which some models are imported.
> IMPORTANT: in watch mode you should define this param if models are imported from some folder.
> Otherwise changes in `src/models` will not trigger new validators generation! Watcher does not
> build dependencies graph and does not know whether you have import statements in your files
- `headerTemplate` (optional) some text in the beginning of the file
- `compilerOptions` (optional) TypeScript CompilerOptions
- `includeChildrenMask` (optional) look at [this section](#include-and-exclude-files)


### Include and exclude files

Most of the plugins have `includeChildrenMask` (RegExp) param in config that may be used to filter files. Examples:

`includeChildrenMask: /\.ts$/` - include only .ts files

`includeChildrenMask: /fileOne/` - include only files that contain fileOne in their name

`includeChildrenMask: /^((?!fileOne\.ts|\.scss).)*$/` - exclude files `fileOne.ts` and all files with `.scss` extension

`includeChildrenMask: /^((?!_).)*$/` - exclude files that have `_` in their filenames

Via RegExp you can include or exclude freely, so no need to create a param like `excludeChildrenMask` 
for plugins.











