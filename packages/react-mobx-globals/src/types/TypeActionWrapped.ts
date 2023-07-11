import { TypeActionData } from './TypeActionData';
import { TypeSkipFirstArg } from './TypeSkipFirstArg';
import { TypeActionGenerator } from './TypeActionGenerator';

export type TypeActionWrapped = TypeSkipFirstArg<TypeActionGenerator<any, any>> & TypeActionData;
