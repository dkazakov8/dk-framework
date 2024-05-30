import { observer } from 'mobx-react-lite';

import { routerStore } from '../../routerStore';
import { routes } from '../../routes';

const Dynamic = observer(() => {
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
            params: { foo: String(Math.random()).slice(2) },
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
