import { createContextProps } from 'dk-react-mobx-globals';

import { redirectTo } from './actions/routing/redirectTo';
import { TypeGlobals } from './models/TypeGlobals';
import { RouterStore } from './stores/routerStore';

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
