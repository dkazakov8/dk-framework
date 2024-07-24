import { createContext } from 'react';

import { TypeGlobals } from '../models/TypeGlobals';

export const GlobalContext = createContext(undefined as unknown as TypeGlobals);
