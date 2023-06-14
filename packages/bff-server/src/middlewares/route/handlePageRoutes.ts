import fs from 'fs';

import { errorCodes, errorsNames, createMeasure, measuresServer } from '../../utils';
import { TypeMiddleware } from '../../types';

export const handlePageRoutes: TypeMiddleware = (app, params) => {
  const template = fs.readFileSync(params.templatePath, 'utf-8');

  app.get('*', (req, res) => {
    const reqExtended: typeof req & { measure: ReturnType<typeof createMeasure> } = req as any;

    /**
     * Create clear store for each request
     *
     */

    Promise.resolve()
      .then(reqExtended.measure.wrap(measuresServer.MIDDLEWARES))

      .then(reqExtended.measure.wrap(measuresServer.RENDER))
      .then(() => params.templateModifier?.({ template, req, res }) || template)
      .then(reqExtended.measure.wrap(measuresServer.RENDER))

      .then(reqExtended.measure.wrap(measuresServer.FULL_TIME))
      .then(
        (modTemplate) =>
          params.injectMeasures?.({
            template: modTemplate,
            measures: reqExtended.measure.getMeasures(),
          }) || modTemplate
      )
      .then((modTemplate) => res.send(modTemplate))
      .catch((error) => {
        /**
         * SILENT & REDIRECT errors are predictable, no logging
         *
         */

        if (error.name === errorsNames.SILENT) {
          return Promise.resolve();
        } else if (error.name === errorsNames.REDIRECT) {
          // eslint-disable-next-line no-console
          console.log('redirect', error.message);

          return res.redirect(error.message);
        }

        /**
         * Errors here are destroying: they may come from creating new store
         * or rendering page to markup, so no chance to draw beautiful error page.
         *
         * TODO?: create static html page for this case
         *
         */

        console.error(error);

        res.status(errorCodes.INTERNAL_ERROR);

        if (params.template500Path) {
          const template500 = fs.readFileSync(params.template500Path, 'utf-8');

          res.send(template500);
        } else {
          res.send('Unpredictable error');
        }

        return Promise.resolve();
      });
  });
};
