import ws from 'ws';

import { startReloadServer } from './startReloadServer';
import { TypeServerParamsManual } from './types';

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
