import fs from 'fs';
import path from 'path';

export const sslOptions = {
  key: fs.readFileSync(path.resolve(__dirname, './ssl-local/cert.key')),
  cert: fs.readFileSync(path.resolve(__dirname, './ssl-local/cert.pem')),
};
