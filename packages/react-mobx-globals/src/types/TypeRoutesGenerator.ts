import { ComponentClass } from 'react';

import { TypeRouteItem } from './TypeRouteItem';

export type TypeRoutesGenerator<T extends Record<string, TypeRouteItem>> = {
  [Key in keyof T]: {
    name: Key;
    path: T[Key]['path'];
    loader: T[Key]['loader'];
    params: T[Key]['params'];

    props?: TypeRouteItem['props'];
    store?: TypeRouteItem['store'];
    storeLoader?: TypeRouteItem['store'];
    actions?: TypeRouteItem['actions'];
    actionsLoader?: TypeRouteItem['actions'];
    component?: ComponentClass;
    validators?: TypeRouteItem['validators'];
    beforeEnter?: TypeRouteItem['beforeEnter'];
    beforeLeave?: TypeRouteItem['beforeLeave'];
  };
};
