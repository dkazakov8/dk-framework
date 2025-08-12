/* eslint-disable @typescript-eslint/naming-convention */

import 'global-jsdom/register';

import { render } from '@testing-library/react/pure';
import { expect } from 'chai';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { spy } from 'sinon';

import { Router } from '../src/Router';
import { getData } from './helpers';
import { routes } from './routes';

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
      .then(() => redirectTo({ route: 'staticRoute' }))
      .then(() => {
        const html = renderToString(<App />);

        expect(html).to.eq('Static');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
      })
      .then(() => redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } }))
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

    let call_beforeSetPageComponent = 0;
    let call_beforeUpdatePageComponent = 0;

    return Promise.resolve()
      .then(() => redirectTo({ route: 'staticRoute' }))
      .then(() => {
        call_beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('Static');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
        expect(spy_beforeSetPageComponent.callCount, 'spy_beforeSetPageComponent').to.deep.eq(
          call_beforeSetPageComponent
        );
        expect(spy_beforeUpdatePageComponent.callCount, 'spy_beforeUpdatePageComponent').to.deep.eq(
          call_beforeUpdatePageComponent
        );
      })
      .then(() => redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } }))
      .then(() => {
        call_beforeSetPageComponent += 1;
        call_beforeUpdatePageComponent += 1;

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
        expect(spy_beforeSetPageComponent.callCount, 'spy_beforeSetPageComponent').to.deep.eq(
          call_beforeSetPageComponent
        );
        expect(spy_beforeUpdatePageComponent.callCount, 'spy_beforeUpdatePageComponent').to.deep.eq(
          call_beforeUpdatePageComponent
        );
      })
      .then(() => redirectTo({ route: 'dynamicRoute', params: { static: 'dsa' } }))
      .then(() => {
        // No rerender if only params changed and route is the same
        expect(container.innerHTML).to.eq('<div>Dynamic</div>');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
        expect(spy_beforeSetPageComponent.callCount, 'spy_beforeSetPageComponent').to.deep.eq(
          call_beforeSetPageComponent
        );
        expect(spy_beforeUpdatePageComponent.callCount, 'spy_beforeUpdatePageComponent').to.deep.eq(
          call_beforeUpdatePageComponent
        );
      })
      .then(() => redirectTo({ route: 'dynamicRoute2', params: { static: 'dsa' } }))
      .then(() => {
        // No rerender if only params changed and pageName is the same
        expect(container.innerHTML).to.eq('<div>Dynamic</div>');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
        expect(spy_beforeSetPageComponent.callCount, 'spy_beforeSetPageComponent').to.deep.eq(
          call_beforeSetPageComponent
        );
        expect(spy_beforeUpdatePageComponent.callCount, 'spy_beforeUpdatePageComponent').to.deep.eq(
          call_beforeUpdatePageComponent
        );
      })
      .then(() => redirectTo({ route: 'noPageName', params: { foo: 'foo' } }))
      .then(() => {
        call_beforeSetPageComponent += 1;
        call_beforeUpdatePageComponent += 1;

        expect(container.innerHTML).to.eq('<div>No page name</div>');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
        expect(spy_beforeSetPageComponent.callCount, 'spy_beforeSetPageComponent').to.deep.eq(
          call_beforeSetPageComponent
        );
        expect(spy_beforeUpdatePageComponent.callCount, 'spy_beforeUpdatePageComponent').to.deep.eq(
          call_beforeUpdatePageComponent
        );
      })
      .then(() => redirectTo({ route: 'noPageName', params: { foo: 'bar' } }))
      .then(() => {
        // No rerender if only params changed and no pageName
        expect(container.innerHTML).to.eq('<div>No page name</div>');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
        expect(spy_beforeSetPageComponent.callCount, 'spy_beforeSetPageComponent').to.deep.eq(
          call_beforeSetPageComponent
        );
        expect(spy_beforeUpdatePageComponent.callCount, 'spy_beforeUpdatePageComponent').to.deep.eq(
          call_beforeUpdatePageComponent
        );
      })
      .then(() => redirectTo({ route: 'noPageName2', params: { foo: 'foo', bar: 'bar' } }))
      .then(() => {
        // Rerender if no page name
        call_beforeSetPageComponent += 1;
        call_beforeUpdatePageComponent += 1;

        expect(container.innerHTML).to.eq('<div>No page name</div>');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
        expect(spy_beforeSetPageComponent.callCount, 'spy_beforeSetPageComponent').to.deep.eq(
          call_beforeSetPageComponent
        );
        expect(spy_beforeUpdatePageComponent.callCount, 'spy_beforeUpdatePageComponent').to.deep.eq(
          call_beforeUpdatePageComponent
        );
      })
      .then(() => redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } }))
      .then(() => {
        call_beforeSetPageComponent += 1;
        call_beforeUpdatePageComponent += 1;

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');
        expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
        expect(spy_beforeSetPageComponent.callCount, 'spy_beforeSetPageComponent').to.deep.eq(
          call_beforeSetPageComponent
        );
        expect(spy_beforeUpdatePageComponent.callCount, 'spy_beforeUpdatePageComponent').to.deep.eq(
          call_beforeUpdatePageComponent
        );
      });
  }

  it('SSR', () => test1('separate').then(() => test1('store')));
  it('Client', () => test2('separate').then(() => test2('store')));
});
