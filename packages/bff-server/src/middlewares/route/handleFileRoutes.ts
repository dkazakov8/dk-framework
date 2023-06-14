import url from 'url';

import serveStatic from 'serve-static';
import express from 'express';

import { TypeMiddleware } from '../../types';
import { errorCodes, compressions, getAcceptedCompression } from '../../utils';

function setContentTypeAndEncoding(params: {
  encoding: typeof compressions[number]['encoding'];
  contentType: 'application/javascript' | 'text/css';
}): express.Handler {
  const { encoding, contentType } = params;

  return (req, res, next) => {
    res.set('Content-Type', contentType);
    res.set('Content-Encoding', encoding);

    return next();
  };
}

const redirectToCompressed: TypeMiddleware = (app) => {
  app.use((req, res, next) => {
    if (req.url.endsWith('.js') || req.url.endsWith('.css')) {
      const acceptedCompression = getAcceptedCompression(req);

      if (acceptedCompression) {
        req.url = `${req.url}.${acceptedCompression.extension}`;
      }
    }

    next();
  });
};

const setEncodingsForCompressedFiles: TypeMiddleware = (app) => {
  compressions.forEach(({ encoding, extension }) => {
    app.get(
      `*.js.${extension}`,
      setContentTypeAndEncoding({ encoding, contentType: 'application/javascript' })
    );
    app.get(`*.css.${extension}`, setContentTypeAndEncoding({ encoding, contentType: 'text/css' }));
  });
};

export const handleFileRoutes: TypeMiddleware = (app, params) => {
  app.disable('x-powered-by');

  if (params.compressedFilesGenerated) {
    redirectToCompressed(app, params);
    setEncodingsForCompressedFiles(app, params);
  }

  // Send 404 for server files
  app.get('*', (req, res, next) =>
    req.originalUrl.includes('server') ? res.sendStatus(errorCodes.NOT_FOUND) : next()
  );

  app.use(
    serveStatic(params.staticFilesPath, {
      maxAge: params.maxAgeForStatic,
      setHeaders: (res) => {
        res.header('vary', 'Accept-Encoding');
      },
    })
  );

  (params.customFileMiddlewares || []).forEach((fn) => fn(app, params));

  // Send 404 for all not found files
  app.get('*', (req, res, next) => {
    if (url.parse(req.originalUrl)?.pathname?.includes('.')) {
      // eslint-disable-next-line no-console
      // console.log(`CRITICAL: file URL ${req.url} ORIGINAL ${req.originalUrl} not found, sent 404`);

      return res.sendStatus(errorCodes.NOT_FOUND);
    }

    return next();
  });
};
