import { TypeRole } from './TypeRole';
import { TypeUser } from './TypeUser';

export type TypeUserExtended = TypeUser & {
  role: TypeRole;
  gender: string;
};
