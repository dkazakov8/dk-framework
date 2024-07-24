import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { Router as RouterMobx } from 'dk-react-mobx-router';

import { routes } from '../routes';

import { GlobalContext } from './GlobalContext';

export const Router = observer(() => {
  const { store, actions } = useContext(GlobalContext);

  return (
    <RouterMobx
      routes={routes}
      redirectTo={actions.routing.redirectTo}
      routerStore={store.router}
    />
  );
});
