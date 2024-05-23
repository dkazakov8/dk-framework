import path from 'path';

import { runServer } from 'dk-bff-server';
import { getInitialRoute } from 'dk-react-mobx-router';
import { renderToString } from 'react-dom/server';

import { RouterStore } from './routerStore';
import { StoreContext } from './components/StoreContext';
import { App } from './components/App';
import { routes } from './routes';
import { escapeAllStrings } from './utils/escapeAllStrings';

const self = `'self'`;
const unsafeInline = `'unsafe-inline'`;

void runServer({
  port: 8000,
  https: false,
  templatePath: path.resolve(__dirname, '../build/index.html'),
  template500Path: path.resolve(__dirname, '../build/index.html'),
  staticFilesPath: path.resolve(__dirname, '../build'),
  versionIdentifier: 'local',
  templateModifier: ({ template, req }) => {
    const contextValue = { routerStore: new RouterStore() };
    const app = (
      <StoreContext.Provider value={contextValue}>
        <App />
      </StoreContext.Provider>
    );

    return Promise.resolve()
      .then(() =>
        contextValue.routerStore.redirectTo(
          getInitialRoute({
            routes,
            pathname: req.originalUrl,
            fallback: routes.error404,
          })
        )
      )
      .then(() => renderToString(app))
      .then((htmlMarkup) => {
        const storeJS = JSON.parse(JSON.stringify(contextValue));

        const hotReloadUrl = `http://${req.headers.host?.split(':')[0]}:8001`;

        return template
          .replace(`<!-- HTML -->`, htmlMarkup)
          .replace('<!-- INITIAL_DATA -->', JSON.stringify(escapeAllStrings(storeJS)))
          .replace('<!-- HOT_RELOAD -->', `<script src="${hotReloadUrl}"></script>`);
      });
  },
  helmetOptions: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [self],
        scriptSrc: [self, unsafeInline, `localhost:8001`],
        connectSrc: [self, `ws://localhost:8001`],
      },
      reportOnly: false,
    },
  },
});
