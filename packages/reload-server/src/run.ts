import { TypeServerParams } from './types';
import { startFileWatcher } from './startFileWatcher';
import { startReloadServer } from './startReloadServer';

export function run(params: TypeServerParams) {
  const wsServer = startReloadServer(params);

  startFileWatcher(params, wsServer);
}
