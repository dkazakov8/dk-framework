import { TypeMiddleware } from '../../types';
import { serverRoutes } from '../../utils/serverRoutes';

export const handleGetAppVersion: TypeMiddleware = (app, params) => {
  app.get(serverRoutes.getAppVersion, (req, res) => {
    res.send({ GIT_COMMIT: params.versionIdentifier });
  });
};
