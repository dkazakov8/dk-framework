import { TypeGlobalsAny } from '../types/TypeGlobalsAny';
import { TypeCreateContextParams } from '../types/TypeCreateContextParams';

export function setGlobalStores(
  globals: TypeGlobalsAny,
  staticStores: TypeCreateContextParams['staticStores']
) {
  Object.entries(staticStores).map(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ([storeName, StoreClass]) => (globals.store[storeName] = new StoreClass())
  );
}
