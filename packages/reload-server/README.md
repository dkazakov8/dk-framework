## Reload browser on files change

[![npm](https://img.shields.io/npm/v/dk-reload-server)](https://www.npmjs.com/package/dk-reload-server)
[![license](https://img.shields.io/npm/l/dk-reload-server)](https://github.com/dkazakov8/dk-reload-server/blob/master/LICENSE)

### Installation

Add `dk-reload-server` to `package.json` and install.

### Features
- reloads browser by WebSocket connection when watched files have been modified
- aggregates changed files by `aggregationTimeout`
- logs changed files if needed
- works by `http` or `https`

Compared to `browser-refresh` this app has much less code and dependencies, does not modify
`process.env`, includes basic SSL certificates, does not replace main server start command
(to `browser-refresh server.js` instead of `node server.js`), does not need `process.send('online')`
to start working, does not depend on Node.js server restart (you mostly just rebuild client files
and don't need to restart server).

### When to use

Most of bundlers can handle page reloads by their own WebSocket server implementations, but
you have to use their dev-servers or middlewares. When you have custom Backend-For-Frontend server
that is built by separate process and bundler config or even by other bundler, these solutions would
not work properly.

### Usage

1. Create file that will start reload server and file watcher (ex. `src/watchServer.ts`)

```typescript
import path from 'path';

import { run } from 'dk-reload-server';

run({
  port: 401,
  https: true,
  watchPaths: [path.resolve(__dirname, '../build')],
  changedFilesLogs: true,
  aggregationTimeout: 50,
});
```

2. Add to html template (presumably via template modification on server start)
```html
<script src="https://localhost:401"></script>
```

3. Add recipe like this to `package.json` scripts section
```json
{
  "reload-browser": "yarn -s babel-node --extensions .ts ./src/watchServer.ts"
}
```
Run and stop when you need (presumably run after dev build completed and stop on SIGINT).

### Params

- `port` (number) - on which port server will start
- `watchPaths` (array of strings) - absolute paths of watched folders or files
- `https` (boolean) (optional) - use https protocol or not
- `ignored` (optional) - passed directly to [chokidar](https://github.com/paulmillr/chokidar) `ignored` param, so 
files by this pattern will not trigger page reload
- `changedFilesLogs` (boolean) (optional) - show modified files that trigger page reload in console
- `aggregationTimeout` (number) (optional) - aggregate changed file for this period in ms