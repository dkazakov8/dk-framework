import http from 'http';
import https from 'https';

import express from 'express';

import { TypeRunServerParams, TypeMiddleware } from '../types';

import { sslOptions } from './sslOptions';

const SSL_PORT = 443;

export function createServer(params: TypeRunServerParams) {
  return {
    app: express(),
    port: params.https ? SSL_PORT : params.port,
    start(): Promise<https.Server | http.Server> {
      const ssl = params.customSsl || sslOptions;

      const nodeServer = params.https
        ? https.createServer(ssl, this.app)
        : http.createServer(this.app);

      return new Promise((resolve) => {
        nodeServer.listen(this.port, () => {
          const protocol = params.https ? 'https' : 'http';
          const link = `${protocol}://localhost${params.https ? '' : `:${params.port}`}`;

          // eslint-disable-next-line no-console
          console.log(`started on`, link);

          resolve(nodeServer);
        });
      });
    },
    useMiddlewares(middlewares: Array<TypeMiddleware>) {
      middlewares.forEach((fn) => fn(this.app, params));

      return this;
    },
  };
}
