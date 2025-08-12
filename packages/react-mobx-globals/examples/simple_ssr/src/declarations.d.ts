declare const PATH_SEP: string;

declare module 'better-spawn' {
  const exp: (command: string, options?: any) => { close: () => void; stdout: any; stderr: any } =
    () => {
      return void 0;
    };

  // eslint-disable-next-line import/no-default-export,import/no-unused-modules
  export default exp;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions,@typescript-eslint/naming-convention
interface Window {
  INITIAL_DATA: any;
}
