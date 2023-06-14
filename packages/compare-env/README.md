## Comparison utility for .env files

[![coverage](https://img.shields.io/codecov/c/gh/dkazakov8/dk-compare-env/master)](https://codecov.io/gh/dkazakov8/dk-compare-env)
[![npm](https://img.shields.io/npm/v/dk-compare-env)](https://www.npmjs.com/package/dk-compare-env)
[![license](https://img.shields.io/npm/l/dk-compare-env)](https://github.com/dkazakov8/dk-compare-env/blob/master/LICENSE)

In enterprise projects you often need to pass some environment params to your application.
The good way is to create different files like

```
.env
example.dev.env
example.prod.env
```

and include them using `dotenv`. It's also good to create `env.ts` file that will parse this params
in accordance with expected types, filters some secret data and could be imported in application.

Current `.env` should be always git-ignored so no sensitive data is leaked and every server or 
developer could configure it as he likes.

But when you deal with different files with similar structure there is always way to make a mistake -
for example `example.dev.env` was changed, so local `.env` on other dev's machine becomes out-of-date,
which leads to application error.

### Purpose of this lib

- compares different `.env` files and prints absent keys
- compares `.env` keys with those in `env.ts`

### Usage

1. Add `dk-compare-env` to package.json
2. Call before you start your build
```javascript
const path = require('path');

import { compareEnvFiles } from 'dk-compare-env';

import { env } from './env';

compareEnvFiles({ 
  paths: [
    path.resolve(__dirname, '.env'),
    path.resolve(__dirname, 'example.dev.env'),
    path.resolve(__dirname, 'example.prod.env'),
  ],
  parsedEnvKeys: Object.keys(env) // optional
});
```
where `paths` are absolute paths and `parsedEnvKeys` (optional) is array of strings.