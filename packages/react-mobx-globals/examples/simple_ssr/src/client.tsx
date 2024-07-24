import { hydrateRoot } from 'react-dom/client';
import { restoreState } from 'dk-mobx-restore-state';
import { loadComponentToConfig } from 'dk-react-mobx-router';

import './style.css';
import { routes } from './routes';
import { App } from './components/App';
import { GlobalContext } from './components/GlobalContext';
import { createGlobals } from './createGlobals';

const globals = createGlobals();
const initialData = window.INITIAL_DATA;

void Promise.resolve()
  .then(() => restoreState({ target: globals, source: initialData }))
  .then(() => {
    const preloadedRouteName = Object.keys(routes).find(
      (routeName) => globals.store.router.currentRoute.name === routeName
    ) as keyof typeof routes;

    return loadComponentToConfig({ route: routes[preloadedRouteName] });
  })
  .then(() =>
    hydrateRoot(
      document.getElementById('app')!,
      <GlobalContext.Provider value={globals}>
        <App />
      </GlobalContext.Provider>
    )
  );
