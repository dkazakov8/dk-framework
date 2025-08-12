import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import { Router } from './Router';
import { StoreContext } from './StoreContext';

export const App = observer(() => {
  const { routerStore } = useContext(StoreContext);

  return (
    <>
      <div className={'topnav'}>
        <a
          onClick={(event) => {
            event.preventDefault();

            void routerStore.redirectTo({ route: 'home' });
          }}
          className={routerStore.currentRoute.name === 'home' ? 'active' : ''}
        >
          Home
        </a>
        <a
          onClick={(event) => {
            event.preventDefault();

            void routerStore.redirectTo({ route: 'static' });
          }}
          className={routerStore.currentRoute.name === 'static' ? 'active' : ''}
        >
          Static
        </a>
        <a
          onClick={(event) => {
            event.preventDefault();

            void routerStore.redirectTo({
              route: 'dynamic',
              params: { foo: 'dynamic-value' },
            });
          }}
          className={routerStore.currentRoute.name === 'dynamic' ? 'active' : ''}
        >
          Dynamic
        </a>
        <a
          onClick={(event) => {
            event.preventDefault();

            void routerStore.redirectTo({
              route: 'query',
              query: { foo: 'value' },
            });
          }}
          className={routerStore.currentRoute.name === 'query' ? 'active' : ''}
        >
          Query
        </a>
        <a
          onClick={(event) => {
            event.preventDefault();

            void routerStore.redirectTo({
              route: 'preventRedirect',
            });
          }}
          className={routerStore.currentRoute.name === 'preventRedirect' ? 'active' : ''}
        >
          Prevent redirect
        </a>
        <a href={'/not-existing-path'}>Not existing</a>
      </div>
      <div className={'pageContent'}>
        <Router />
      </div>
    </>
  );
});
