import { TypeUser } from '../models/TypeUser';

type TypeRequest = {};

type TypeResponse = TypeUser;

export const getUser: {
  url: string;
  request: TypeRequest;
  response: TypeResponse;
} = {
  url: `/api/user`,
  request: {} as TypeRequest,
  response: {} as TypeResponse,
};
