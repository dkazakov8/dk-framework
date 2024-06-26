import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import { StoreContext } from './StoreContext';
import { Router } from './Router';

export const App = observer(() => {
  const { routerStore } = useContext(StoreContext);

  return (
    <>
      <div className={'topnav'}>
        <a
          onClick={(event) => {
            event.preventDefault();

            void routerStore.redirectTo({ route: 'home' });
          }}
          className={routerStore.currentRoute.name === 'home' ? 'active' : ''}
        >
          Home
        </a>
        <a
          onClick={(event) => {
            event.preventDefault();

            void routerStore.redirectTo({ route: 'static' });
          }}
          className={routerStore.currentRoute.name === 'static' ? 'active' : ''}
        >
          Static
        </a>
        <a
          onClick={(event) => {
            event.preventDefault();

            void routerStore.redirectTo({
              route: 'dynamic',
              params: { foo: 'dynamic-value' },
            });
          }}
          className={routerStore.currentRoute.name === 'dynamic' ? 'active' : ''}
        >
          Dynamic
        </a>
        <a href={'/not-existing-path'}>Not existing</a>
      </div>
      <div className={'pageContent'}>
        <Router />
      </div>
    </>
  );
});
