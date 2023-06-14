import webpack from 'webpack';

export function getAppName(config: webpack.Configuration): string {
  return config.name || (config?.output?.filename as string) || String(process.pid);
}
