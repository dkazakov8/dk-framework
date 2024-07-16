/* eslint-disable no-restricted-syntax */

import path from 'path';
import http from 'http';
import fs from 'fs';

import { renderToString } from 'react-dom/server';
import express from 'express';
import serveStatic from 'serve-static';
import { getInitialRoute } from 'dk-react-mobx-router';

import { RouterStore } from './routerStore';
import { StoreContext } from './components/StoreContext';
import { App } from './components/App';
import { routes } from './routes';
import { escapeAllStrings } from './utils/escapeAllStrings';

const app = express()
  .disable('x-powered-by')
  .use(serveStatic(path.resolve(__dirname, '../build/public')))
  .get('*', async (req, res) => {
    const contextValue = { routerStore: new RouterStore() };
    const reactApp = (
      <StoreContext.Provider value={contextValue}>
        <App />
      </StoreContext.Provider>
    );

    try {
      await contextValue.routerStore.redirectTo(
        getInitialRoute({
          routes,
          pathname: req.originalUrl,
          fallback: 'error404',
        })
      );
    } catch (error: any) {
      if (error.name === 'REDIRECT') {
        // eslint-disable-next-line no-console
        console.log('redirect', error.message);

        res.redirect(error.message);

        return;
      }

      console.error(error);

      const template500 = fs.readFileSync(path.resolve(__dirname, '../build/index.html'), 'utf-8');

      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      res.status(500).send(template500);

      return;
    }

    const htmlMarkup = renderToString(reactApp);
    const storeJS = JSON.parse(JSON.stringify(contextValue));

    const hotReloadUrl = `http://${req.headers.host?.split(':')[0]}:8001`;

    res.send(
      fs
        .readFileSync(path.resolve(__dirname, '../build/public/index.html'), 'utf-8')
        .replace(`<!-- HTML -->`, htmlMarkup)
        .replace('<!-- INITIAL_DATA -->', JSON.stringify(escapeAllStrings(storeJS)))
        .replace('<!-- HOT_RELOAD -->', `<script src="${hotReloadUrl}"></script>`)
    );
  });

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
http.createServer(app).listen(8000, () => {
  const link = `http://localhost:8000`;

  // eslint-disable-next-line no-console
  console.log(`started on`, link);
});
