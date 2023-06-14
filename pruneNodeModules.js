const fs = require('fs');
const path = require('path');

const nodeModulesPathGlobal = path.resolve(__dirname, `./node_modules`);

if (fs.existsSync(nodeModulesPathGlobal))
  fs.rm(nodeModulesPathGlobal, { recursive: true }, () => false);

const packages = fs.readdirSync(path.resolve(__dirname, './packages'));

packages.forEach((packageName) => {
  const nodeModulesPath = path.resolve(__dirname, `./packages/${packageName}/node_modules`);

  if (fs.existsSync(nodeModulesPath)) fs.rm(nodeModulesPath, { recursive: true }, () => false);
});
