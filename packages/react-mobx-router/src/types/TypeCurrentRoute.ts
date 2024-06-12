import { TypeRoute } from './TypeRoute';

export type TypeCurrentRoute<TRoute extends TypeRoute> = {
  name: TRoute['name'];
  path: TRoute['path'];
  props: TRoute['props'];
  query: Partial<Record<keyof TRoute['params'], string>>;
  params: Record<keyof TRoute['params'], string>;
  pageName: TRoute['pageName'];
};
