/* eslint-disable @typescript-eslint/naming-convention */

import 'global-jsdom/register';
import { expect } from 'chai';
import { spy } from 'sinon';
import React from 'react';
import { render } from '@testing-library/react/pure';
import { observer } from 'mobx-react-lite';
import { renderToString } from 'react-dom/server';

import { Router } from '../src/Router';

import { routes } from './routes';
import { getData } from './helpers';

describe('Router', () => {
  function test1(mode: 'separate' | 'store') {
    const customRoutes = routes;

    const { redirectTo, routerStore } = getData(mode, customRoutes);

    const spy_render = spy();

    const App = observer(() => {
      spy_render();

      return <Router routerStore={routerStore} routes={customRoutes} redirectTo={redirectTo} />;
    });

    return Promise.resolve()
      .then(() => redirectTo({ route: customRoutes.staticRoute }))
      .then(() => {
        const html = renderToString(<App />);

        expect(html).to.eq('Static');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
      })
      .then(() => redirectTo({ route: customRoutes.dynamicRoute, params: { static: 'asd' } }))
      .then(() => {
        const html = renderToString(<App />);

        expect(html).to.eq('<div>Dynamic</div>');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(2);
      });
  }

  function test2(mode: 'separate' | 'store') {
    const customRoutes = routes;

    const { redirectTo, routerStore } = getData(mode, customRoutes);

    const spy_render = spy();
    const spy_beforeSetPageComponent = spy();
    const spy_beforeUpdatePageComponent = spy();

    const App = observer(() => {
      spy_render();

      return (
        <Router
          routerStore={routerStore}
          routes={customRoutes}
          redirectTo={redirectTo}
          beforeSetPageComponent={spy_beforeSetPageComponent}
          beforeUpdatePageComponent={spy_beforeUpdatePageComponent}
        />
      );
    });

    const { container } = render(<App />);

    return Promise.resolve()
      .then(() => redirectTo({ route: customRoutes.staticRoute }))
      .then(() => {
        expect(container.innerHTML).to.eq('Static');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
        expect(spy_beforeSetPageComponent.callCount, 'spy_beforeSetPageComponent').to.deep.eq(1);
        expect(spy_beforeUpdatePageComponent.callCount, 'spy_beforeUpdatePageComponent').to.deep.eq(
          0
        );
      })
      .then(() => redirectTo({ route: customRoutes.dynamicRoute, params: { static: 'asd' } }))
      .then(() => {
        expect(container.innerHTML).to.eq('<div>Dynamic</div>');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
        expect(spy_beforeSetPageComponent.callCount, 'spy_beforeSetPageComponent').to.deep.eq(2);
        expect(spy_beforeUpdatePageComponent.callCount, 'spy_beforeUpdatePageComponent').to.deep.eq(
          1
        );
      })
      .then(() => redirectTo({ route: customRoutes.dynamicRoute, params: { static: 'dsa' } }))
      .then(() => {
        // No rerender if only params changed and route is the same
        expect(container.innerHTML).to.eq('<div>Dynamic</div>');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
        expect(spy_beforeSetPageComponent.callCount, 'spy_beforeSetPageComponent').to.deep.eq(2);
        expect(spy_beforeUpdatePageComponent.callCount, 'spy_beforeUpdatePageComponent').to.deep.eq(
          1
        );
      })
      .then(() => redirectTo({ route: customRoutes.dynamicRoute2, params: { static: 'dsa' } }))
      .then(() => {
        // No rerender if only params changed and pageName is the same
        expect(container.innerHTML).to.eq('<div>Dynamic</div>');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
        expect(spy_beforeSetPageComponent.callCount, 'spy_beforeSetPageComponent').to.deep.eq(2);
        expect(spy_beforeUpdatePageComponent.callCount, 'spy_beforeUpdatePageComponent').to.deep.eq(
          1
        );
      });
  }

  it('SSR', () => test1('separate').then(() => test1('store')));
  it('Client', () => test2('separate').then(() => test2('store')));
});
