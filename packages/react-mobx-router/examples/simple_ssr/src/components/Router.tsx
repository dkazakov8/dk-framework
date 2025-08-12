import { Router as RouterMobx } from 'dk-react-mobx-router';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import { routes } from '../routes';
import { StoreContext } from './StoreContext';

export const Router = observer(() => {
  const { routerStore } = useContext(StoreContext);

  return (
    <RouterMobx routes={routes} redirectTo={routerStore.redirectTo} routerStore={routerStore} />
  );
});
