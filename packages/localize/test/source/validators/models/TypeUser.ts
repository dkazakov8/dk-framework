import { TypeRole } from './TypeRole';

export type TypeUser = {
  email: string;
  name: string;
  role: TypeRole;
  someData: Array<[number, string]>;
};
