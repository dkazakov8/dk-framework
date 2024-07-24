> [!WARNING]  
> It's fine if you use this library from NPM package with a **static versioning** in case you
> want it for some pet-project or to test it's capabilities.
>
> But for production use it's **strongly recommended** to create a fork, because I do not write
> Changelogs and may break / add some functionality without notice.

I CURRENTLY WRITE THIS DOCUMENTATION, IT'S NOT READY YET

This library is intended to be used in SSR projects with a layered architecture. For SPA it's not
helpful because you can directly import all the layers where needed as Singletones. But in SSR
the only way to configure DI is to use a context. So, this library helps with that.

### Setup (SSR)

This example is based on the documentation of 
[dk-react-mobx-router](https://github.com/dkazakov8/dk-framework/tree/master/packages/react-mobx-router).
But you may use any routing library that supports async loaded page chunks.

The setup consists of two parts:
- TypeGlobals: TS-model which describes global and modular layers
- Global object: an object representing TypeGlobals

1. Install `dk-react-mobx-globals`, `dk-localize` and `dk-request`
2. Create `models/TypeGlobals.ts`

```typescript
import { getLn } from 'dk-localize';
import { TypeGlobalsGenerator } from 'dk-react-mobx-globals';

import { RouterStore } from '../stores/routerStore';

export type TypeGlobals = TypeGlobalsGenerator<
  any,
  { routerStore: typeof RouterStore },
  any,
  any,
  any,
  typeof getLn
>;
```

3. Create `globals.ts`

```typescript
import { createContextProps } from 'dk-react-mobx-globals';

import { RouterStore } from './stores/routerStore';
import { TypeGlobals } from './models/TypeGlobals';

const globals = createContextProps<TypeGlobals>({
  api: {},
  request: () => Promise.resolve(),
  staticStores: { routerStore: RouterStore },
  apiValidators: {},
  globalActions: {},
});

export { globals };
```








