/**
 * @docs: https://github.com/websockets/ws
 *
 */

import http from 'http';
import https from 'https';

import ws from 'ws';

import { sslOptions } from './sslOptions';
import { TypeServerParams } from './types';

export function startReloadServer(params: TypeServerParams) {
  const requestListener: http.RequestListener = (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers,@typescript-eslint/naming-convention
    res.writeHead(200, { 'Content-Type': 'text/javascript' });
    res.end(`
(function refresh() {
  let socketUrl = window.location.origin;
  let attempt = 0;
  const maxAttempts = 5;
  
  if (!socketUrl.match(/:[0-9]+/)) { socketUrl = socketUrl + ':80'; }
  
  socketUrl = socketUrl.replace(/(^http(s?):\\/\\/)(.*:)(.*)/,${`'ws$2://$3${params.port}`}');

  function websocketWaiter() {
    if (attempt > maxAttempts) {
      console.warn('[PAGE-RELOAD] has stopped due to reconnection issues');
      return;
    }
  
    const socket = new WebSocket(socketUrl);

    socket.onopen = function socketOnOpen() {
      attempt = 0;
    };

    socket.onmessage = function socketOnMessage(msg) {
      if (msg.data !== 'reload') return;

      socket.close();
      
      window.location.reload();
    };

    socket.onclose = function socketOnClose() { 
      setTimeout(websocketWaiter, 1000); 
      attempt++;
    };
  }

  window.addEventListener('load', websocketWaiter);
})();
`);
  };

  const server = params.https
    ? https.createServer(sslOptions, requestListener)
    : http.createServer(requestListener);

  return new ws.Server({ server: server.listen(params.port) });
}
