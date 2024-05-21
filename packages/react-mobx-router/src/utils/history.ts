import { createBrowserHistory } from 'history';

import { constants } from './constants';

/**
 * @docs: https://github.com/ReactTraining/history
 *
 */

export const history: ReturnType<typeof createBrowserHistory> = constants.isClient
  ? createBrowserHistory()
  : null!;
