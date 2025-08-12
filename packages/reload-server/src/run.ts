import { startFileWatcher } from './startFileWatcher';
import { startReloadServer } from './startReloadServer';
import { TypeServerParams } from './types';

export function run(params: TypeServerParams) {
  const wsServer = startReloadServer(params);

  startFileWatcher(params, wsServer);
}
