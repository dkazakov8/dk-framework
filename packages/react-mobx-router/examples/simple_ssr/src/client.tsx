import { getInitialRoute } from 'dk-react-mobx-router';
import { hydrateRoot } from 'react-dom/client';
import { restoreState } from 'dk-mobx-restore-state';

import './style.css';
import { routes } from './routes';
import { RouterStore } from './routerStore';
import { App } from './components/App';
import { StoreContext } from './components/StoreContext';

const contextValue = { routerStore: new RouterStore() };
const initialData = window.INITIAL_DATA;

void Promise.resolve()
  .then(() => restoreState({ target: contextValue, source: initialData }))
  .then(() =>
    contextValue.routerStore.redirectTo(
      getInitialRoute({
        routes,
        pathname: contextValue.routerStore.currentRoute.path,
        fallback: routes.error404,
      })
    )
  )
  .then(() =>
    hydrateRoot(
      document.getElementById('app')!,
      <StoreContext.Provider value={contextValue}>
        <App />
      </StoreContext.Provider>
    )
  );
