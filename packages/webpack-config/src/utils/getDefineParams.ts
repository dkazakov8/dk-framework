import path from 'path';

export function getDefineParams({ isClient }: { isClient: boolean }) {
  const globals = {
    IS_CLIENT: JSON.stringify(isClient),
    PATH_SEP: JSON.stringify(path.sep),
    IS_TEST: 'false',
  };

  if (global.defineParams) {
    Object.entries(global.defineParams).forEach(([key, value]) => {
      Object.assign(globals, { [key]: JSON.stringify(value) });
    });
  }

  return globals;
}
