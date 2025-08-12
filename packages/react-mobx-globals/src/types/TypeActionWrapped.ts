import { TypeFnState } from 'dk-mobx-stateful-fn';

import { TypeActionGenerator } from './TypeActionGenerator';
import { TypeSkipFirstArg } from './TypeSkipFirstArg';

export type TypeActionWrapped = TypeSkipFirstArg<TypeActionGenerator<any, any>> & TypeFnState;
