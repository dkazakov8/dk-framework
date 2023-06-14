import { TypeRole } from './TypeRole';
import { TypeTaskAny } from './tasks/TypeTaskAny';

export type TypeUser = {
  email: string;
  name: string;
  task: TypeTaskAny;
  role: TypeRole;
  someData: Array<[number, string]>;
};
