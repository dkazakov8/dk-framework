## Utility for removing extraneous params via ts-interface-checker

[![coverage](https://img.shields.io/codecov/c/gh/dkazakov8/dk-checker-remove-extraneous/master)](https://codecov.io/gh/dkazakov8/dk-checker-remove-extraneous)
[![npm](https://img.shields.io/npm/v/dk-checker-remove-extraneous)](https://www.npmjs.com/package/dk-checker-remove-extraneous)
[![license](https://img.shields.io/npm/l/dk-checker-remove-extraneous)](https://github.com/dkazakov8/dk-checker-remove-extraneous/blob/master/LICENSE)

### Installation

Add `dk-checker-remove-extraneous` to package.json and install.

### Usage

This lib works with [ts-interface-checker](https://github.com/gristlabs/ts-interface-checker). You can use
[dk-file-generator](https://github.com/dkazakov8/dk-file-generator) for suitable validators generation.

Add to places where validators are used, ex. for API response:

```typescript
import _ from 'lodash';
import { createCheckers } from 'ts-interface-checker';
import { removeExtraneousParams } from 'dk-checker-remove-extraneous';

import * as apiValidatorsRaw from 'validators/api';

const apiValidators = _.mapValues(apiValidatorsRaw, (value) => createCheckers(value));

function validateResponse(
  apiName: string,
  response: any
) {
  const validators = apiValidators[apiName];

  try {
    // Check mandatory params, throw on error
    validators.TypeResponse.check(response);

    // Clear extraneous params for compatibility (mutable operation)
    removeExtraneousParams({
      data: response,
      validators: validators.TypeResponse, // TypeResponse is a checker, use your name
      logger: ({ extraneousPaths }) => {
        console.warn(`Omitted extraneous ${JSON.stringify(extraneousPaths)} for "api/${apiName}"`);
      },
    });

    // Now response is carefully checked and extraneous params are removed,
    // it's safe to use it as expected
    return response;
  } catch (error) {
    throw new Error(`validateResponse: ${error.message} for "api/${apiName}"`);
  }
}

// Use in fetch
fetch(url)
  .then(fetchResponse => fetchResponse.json())
  .then(response => validateResponse('someApi', response))
  .then(validatedResponse => someLogic(validatedResponse))
  .catch((error) => someErrorHandler(error));
```
