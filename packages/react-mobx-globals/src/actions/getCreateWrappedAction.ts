import { addState } from 'dk-mobx-stateful-fn';

import { TypeActionAny } from '../types/TypeActionAny';
import { TypeGlobalsAny } from '../types/TypeGlobalsAny';
import { TypeActionWrapped } from '../types/TypeActionWrapped';
import { TypeCreateContextParams } from '../types/TypeCreateContextParams';

export function getCreateWrappedAction(
  globals: TypeGlobalsAny,
  transformers: TypeCreateContextParams['transformers'],
  fn: TypeActionAny
): TypeActionWrapped {
  const action = addState({
    fn: fn.bind(null, globals),
    name: fn.name,
    transformers,
  });

  return action;
}
