import { TypeActionAny } from './TypeActionAny';
import { TypeSkipFirstArg } from './TypeSkipFirstArg';

export type TypeActionBound = TypeSkipFirstArg<TypeActionAny>;
