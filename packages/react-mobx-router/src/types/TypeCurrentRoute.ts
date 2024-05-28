import { TypeRoute } from './TypeRoute';

export type TypeCurrentRoute<TRoute extends TypeRoute> = {
  name: TRoute['name'];
  path: TRoute['path'];
  props: TRoute['props'];
  params: Record<string, string>;
  pageName: TRoute['pageName'];
};
