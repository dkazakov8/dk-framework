import { TypeFnState } from 'dk-mobx-stateful-fn';

import { TypeSkipFirstArg } from './TypeSkipFirstArg';
import { TypeActionGenerator } from './TypeActionGenerator';

export type TypeActionWrapped = TypeSkipFirstArg<TypeActionGenerator<any, any>> & TypeFnState;
