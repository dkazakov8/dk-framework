import { createContext } from 'react';

import { RouterStore } from '../routerStore';

export const StoreContext = createContext(undefined as unknown as { routerStore: RouterStore });
