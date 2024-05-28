import { TypeRoute } from './TypeRoute';

export type TypeRouteWithParams = Omit<TypeRoute, 'params'> & {
  params: Record<string, string>;
};
