/* eslint-disable no-restricted-syntax */

import path from 'path';
import http from 'http';
import fs from 'fs';

import { renderToString } from 'react-dom/server';
import express from 'express';
import serveStatic from 'serve-static';
import { getInitialRoute } from 'dk-react-mobx-router';

import { GlobalContext } from './components/GlobalContext';
import { App } from './components/App';
import { routes } from './routes';
import { escapeAllStrings } from './utils/escapeAllStrings';
import { createGlobals } from './createGlobals';

const app = express()
  .disable('x-powered-by')
  .use(serveStatic(path.resolve(__dirname, '../build/public')))
  .get('*', async (req, res) => {
    const globals = createGlobals();
    const reactApp = (
      <GlobalContext.Provider value={globals}>
        <App />
      </GlobalContext.Provider>
    );

    try {
      await globals.actions.routing.redirectTo(
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
    const storeJS = JSON.parse(JSON.stringify(globals));

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
