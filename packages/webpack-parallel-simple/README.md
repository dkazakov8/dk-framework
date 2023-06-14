## Simple lib for parallel Webpack builds

[![coverage](https://img.shields.io/codecov/c/gh/dkazakov8/dk-webpack-parallel-simple/master)](https://codecov.io/gh/dkazakov8/dk-webpack-parallel-simple)
[![npm](https://img.shields.io/npm/v/dk-webpack-parallel-simple)](https://www.npmjs.com/package/dk-webpack-parallel-simple)
[![license](https://img.shields.io/npm/l/dk-webpack-parallel-simple)](https://github.com/dkazakov8/dk-webpack-parallel-simple/blob/master/LICENSE)

### Motivation

The existing library [parallel-webpack](https://github.com/trivago/parallel-webpack) is not maintained,
has huge codebase, does not support custom communication between processes, does not show low-level
errors, requires separate file with configs.

This one is a light alternative based on internal Node.js [child_process fork](https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options)

Supports TypeScript configs

### Usage

```javascript
import { ChildProcess } from 'child_process';
import { run, TypeConfig } from 'dk-webpack-parallel-simple';

let childProcesses: Array<ChildProcess> = [];

const parallelConfig: TypeConfig = {
    onInit(processes: Array<ChildProcess>) { childProcesses = processes; },
    bailOnError: false,
    configPaths: [
        path.resolve(__dirname, './client.config'),
        path.resolve(__dirname, './server.config'),
    ],
    afterFirstBuild() {
        childProcesses.forEach((childProcess) => {
            childProcess.send('SOME_MESSAGE');
        });
        
        // ... maybe start Node.js server, browser reload service, file generation service
    },
};

run(parallelConfig);
```

### Params

`bailOnError` - if true all processes will be terminated on the first error

`configPaths` - array of config files' paths

`afterFirstBuild` (optional) - callback that called after first compiler run on every config passed

`onInit` (optional) - passes instances of forked processes so you are able to send messages to your webpack processes and get answers
