import { createContextProps } from 'dk-react-mobx-globals';

import { RouterStore } from './stores/routerStore';
import { TypeGlobals } from './models/TypeGlobals';
import { redirectTo } from './actions/routing/redirectTo';

export function createGlobals() {
  const globals = createContextProps<TypeGlobals>({
    api: {},
    request: () => Promise.resolve(),
    staticStores: { router: RouterStore },
    apiValidators: {},
    globalActions: {
      routing: { redirectTo },
    },
  });

  return globals;
}

// globals.getLn = getLn.bind(null, globals.store.ui.lnData);
