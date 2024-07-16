import { hydrateRoot } from 'react-dom/client';
import { restoreState } from 'dk-mobx-restore-state';
import { loadComponentToConfig } from 'dk-react-mobx-router';

import './style.css';
import { routes } from './routes';
import { RouterStore } from './routerStore';
import { App } from './components/App';
import { StoreContext } from './components/StoreContext';

const contextValue = { routerStore: new RouterStore() };
const initialData = window.INITIAL_DATA;

void Promise.resolve()
  .then(() => restoreState({ target: contextValue, source: initialData }))
  .then(() => {
    const preloadedRouteName = Object.keys(routes).find(
      (routeName) => contextValue.routerStore.currentRoute.name === routeName
    ) as keyof typeof routes;

    return loadComponentToConfig({ route: routes[preloadedRouteName] });
  })
  .then(() =>
    hydrateRoot(
      document.getElementById('app')!,
      <StoreContext.Provider value={contextValue}>
        <App />
      </StoreContext.Provider>
    )
  );
