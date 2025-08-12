import { getInitialRoute, Router as RouterMobx } from 'dk-react-mobx-router';
import { observer } from 'mobx-react-lite';
import { createRoot } from 'react-dom/client';

import './style.css';

import { routerStore } from './routerStore';
import { routes } from './routes';

export const Router = observer(() => {
  return (
    <RouterMobx routes={routes} redirectTo={routerStore.redirectTo} routerStore={routerStore} />
  );
});

const App = observer(() => {
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

void Promise.resolve()
  .then(() =>
    routerStore.redirectTo(
      getInitialRoute({
        routes,
        pathname: location.pathname + location.search,
        fallback: 'error404',
      })
    )
  )
  .then(() => createRoot(document.getElementById('app')!).render(<App />));
