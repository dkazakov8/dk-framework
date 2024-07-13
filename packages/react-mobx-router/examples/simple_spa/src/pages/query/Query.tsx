import { observer } from 'mobx-react-lite';

import { routerStore } from '../../routerStore';

const Query = observer(() => {
  return (
    <>
      <div>Query {JSON.stringify(routerStore.currentRoute.query)}</div>
      {/* eslint-disable-next-line react/forbid-elements */}
      <button
        type={'button'}
        style={{ marginTop: 20 }}
        onClick={() => {
          void routerStore.redirectTo({
            route: 'query',
            query: { foo: String(Math.random()).slice(2) },
          });
        }}
      >
        Go to random query value
      </button>
    </>
  );
});

// eslint-disable-next-line import/no-default-export
export default Query;
