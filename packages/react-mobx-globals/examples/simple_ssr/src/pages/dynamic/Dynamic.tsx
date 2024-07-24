import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import { GlobalContext } from '../../components/GlobalContext';

const Dynamic = observer(() => {
  const { store, actions } = useContext(GlobalContext);

  return (
    <>
      <div>Dynamic {JSON.stringify(store.router.currentRoute.params)}</div>
      {/* eslint-disable-next-line react/forbid-elements */}
      <button
        type={'button'}
        style={{ marginTop: 20 }}
        onClick={() => {
          void actions.routing.redirectTo({
            route: 'dynamic',
            params: { foo: String(Math.random()).slice(2) },
          });
        }}
      >
        Go to random dynamic value
      </button>
      <div style={{ marginTop: 20 }}>
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        Click button and see raw page markup. With SSR we don't even look at URL on frontend during
        hydration, just restore from the server
      </div>
    </>
  );
});

// eslint-disable-next-line import/no-default-export
export default Dynamic;
