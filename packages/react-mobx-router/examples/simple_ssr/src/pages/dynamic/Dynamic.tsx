import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import { routes } from '../../routes';
import { StoreContext } from '../../components/StoreContext';

const Dynamic = observer(() => {
  const { routerStore } = useContext(StoreContext);

  return (
    <>
      <div>Dynamic {JSON.stringify(routerStore.currentRoute.params)}</div>
      {/* eslint-disable-next-line react/forbid-elements */}
      <button
        type={'button'}
        style={{ marginTop: 20 }}
        onClick={() => {
          void routerStore.redirectTo({
            route: routes.dynamic,
            params: { param: String(Math.random()).slice(2) },
          });
        }}
      >
        Go to random dynamic value
      </button>
    </>
  );
});

// eslint-disable-next-line import/no-default-export
export default Dynamic;
