import { InjectManifest } from 'workbox-webpack-plugin';

import { TypePlugin } from '../types';

export const pluginWorkbox: TypePlugin = new InjectManifest({
  swSrc: serviceWorker?.entry || '',
  swDest: serviceWorker?.output || '',
});
