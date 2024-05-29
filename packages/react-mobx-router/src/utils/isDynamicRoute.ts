import { TypeRoute } from '../types/TypeRoute';
import { TypeValidator } from '../types/TypeValidator';

export function isDynamicRoute<TRoute extends TypeRoute>(
  route: TRoute
): route is TRoute & { params: Record<keyof TRoute, TypeValidator> } {
  return 'params' in route;
}
