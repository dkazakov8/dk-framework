import '@swc-node/register';

const configPath = process.argv[2];

const { build } = require('./build');

const config = require(configPath);

build({ config: config.default || config });
