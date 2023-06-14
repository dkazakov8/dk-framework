import bodyParser from 'body-parser';

import { TypeMiddleware } from '../../types';

export const handleUrlencodedRequests: TypeMiddleware = (app) => {
  app.use(bodyParser.urlencoded({ extended: true }));
};
