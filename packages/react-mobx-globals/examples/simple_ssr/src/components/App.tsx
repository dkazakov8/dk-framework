import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import { GlobalContext } from './GlobalContext';
import { Router } from './Router';

export const App = observer(() => {
  const { store, actions } = useContext(GlobalContext);

  return (
    <>
      <div className={'topnav'}>
        <a
          onClick={(event) => {
            event.preventDefault();

            void actions.routing.redirectTo({ route: 'home' });
          }}
          className={store.router.currentRoute.name === 'home' ? 'active' : ''}
        >
          Home
        </a>
        <a
          onClick={(event) => {
            event.preventDefault();

            void actions.routing.redirectTo({ route: 'static' });
          }}
          className={store.router.currentRoute.name === 'static' ? 'active' : ''}
        >
          Static
        </a>
        <a
          onClick={(event) => {
            event.preventDefault();

            void actions.routing.redirectTo({
              route: 'dynamic',
              params: { foo: 'dynamic-value' },
            });
          }}
          className={store.router.currentRoute.name === 'dynamic' ? 'active' : ''}
        >
          Dynamic
        </a>
        <a
          onClick={(event) => {
            event.preventDefault();

            void actions.routing.redirectTo({
              route: 'query',
              query: { foo: 'value' },
            });
          }}
          className={store.router.currentRoute.name === 'query' ? 'active' : ''}
        >
          Query
        </a>
        <a
          onClick={(event) => {
            event.preventDefault();

            void actions.routing.redirectTo({
              route: 'preventRedirect',
            });
          }}
          className={store.router.currentRoute.name === 'preventRedirect' ? 'active' : ''}
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
