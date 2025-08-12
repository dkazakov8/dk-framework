import { getLn } from 'dk-localize';
import { TypeFnState } from 'dk-mobx-stateful-fn';
import { TypeGlobalsGenerator } from 'dk-react-mobx-globals';
import { TypeRedirectToParams } from 'dk-react-mobx-router';

import { routes } from '../routes';
import { RouterStore } from '../stores/routerStore';
// import * as modularStores from 'modularStores';
// import globalActions from 'actions';
// import * as modularActions from 'modularActions';

// export type TypeGlobals = TypeGlobalsGenerator<
//   typeof api,
//   typeof staticStores,
//   { pages: typeof modularStores },
//   typeof globalActions,
//   { pages: typeof modularActions },
//   typeof getLn
// >;

export type TypeGlobals = TypeGlobalsGenerator<
  any,
  { router: typeof RouterStore },
  any,
  any,
  // { routing: { redirectTo: typeof redirectTo } },
  any,
  typeof getLn
> & {
  actions: {
    routing: {
      redirectTo: (<TRouteName extends keyof typeof routes>(
        params: TypeRedirectToParams<typeof routes, TRouteName>
      ) => Promise<void>) &
        TypeFnState;
    };
  };
};
