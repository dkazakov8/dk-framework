import { TypeUserExtended } from '../models/TypeUserExtended';

type TypeRequest = {
  id: string;
};

type TypeResponse = TypeUserExtended;

export const getUserExtended: {
  url: string;
  request: TypeRequest;
  response: TypeResponse;
} = {
  url: `/api/user/extended`,
  request: {} as TypeRequest,
  response: {} as TypeResponse,
};
