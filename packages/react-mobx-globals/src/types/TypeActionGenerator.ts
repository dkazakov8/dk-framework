export type TypeActionGenerator<TGlobals, T = undefined> = T extends undefined
  ? (globals: TGlobals) => Promise<void>
  : (globals: TGlobals, params: T) => Promise<void>;
