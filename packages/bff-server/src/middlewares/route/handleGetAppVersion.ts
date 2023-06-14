import { serverRoutes } from '../../utils/serverRoutes';
import { TypeMiddleware } from '../../types';

export const handleGetAppVersion: TypeMiddleware = (app, params) => {
  app.get(serverRoutes.getAppVersion, (req, res) => {
    res.send({ GIT_COMMIT: params.versionIdentifier });
  });
};
