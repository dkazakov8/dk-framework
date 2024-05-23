import path from 'path';

import { run } from 'dk-reload-server';

run({
  port: 8001,
  watchPaths: [path.resolve(__dirname, '../build')],
  changedFilesLogs: false,
  aggregationTimeout: 200,
});
