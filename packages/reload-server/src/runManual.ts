import ws from 'ws';

import { TypeServerParamsManual } from './types';
import { startReloadServer } from './startReloadServer';

export function runManual(params: TypeServerParamsManual) {
  const wsServer = startReloadServer(params);

  return {
    sendReloadSignal: () => {
      wsServer.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) client.send('reload');
      });
    },
  };
}
