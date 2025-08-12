import http from 'node:http';
import https from 'node:https';

import { handleCompression } from './middlewares/common/handleCompression';
import { handleJsonRequests } from './middlewares/common/handleJsonRequests';
import { handleMeasure } from './middlewares/common/handleMeasure';
import { handleNoCache } from './middlewares/common/handleNoCache';
import { handleProtectionHeaders } from './middlewares/common/handleProtectionHeaders';
import { handleUrlencodedRequests } from './middlewares/common/handleUrlencodedRequests';
import { handleFileRoutes } from './middlewares/route/handleFileRoutes';
import { handleGetAppVersion } from './middlewares/route/handleGetAppVersion';
import { handleMissingRoutes } from './middlewares/route/handleMissingRoutes';
import { handlePageRoutes } from './middlewares/route/handlePageRoutes';
import { TypeRunServerParams } from './types';
import { createServer } from './utils';

export const runServer = (params: TypeRunServerParams): Promise<https.Server | http.Server> => {
  return Promise.resolve()
    .then(() =>
      createServer(params)
        .useMiddlewares([
          /**
           * The order is meaningful.
           *
           * 1. look for the assets (if req.originalUrl has '.') and send 404 when not found
           * 2. Handle all GET requests (send template.html with rendered markup and window.INITIAL_DATA
           * included for store hydration on client).
           * When route is not found just send rendered markup of 404 page (no default redirects).
           * When error occurred send rendered markup of 500 page (also no default redirects).
           * 3. For all missing POST/PUT etc. requests send 404 with JSON
           * {"errorName":"NOT_FOUND","errorMessage":"Route [method] [url] was not found"}
           *
           */

          handleMeasure,
          handleFileRoutes,

          handleNoCache,
          handleProtectionHeaders,
          handleCompression,
          handleJsonRequests,
          handleUrlencodedRequests,

          ...(params.customMiddlewares || []),

          handleGetAppVersion,
          handlePageRoutes,
          handleMissingRoutes,
        ])
        .start()
    )
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
};
