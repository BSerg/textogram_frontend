import * as React from 'react';

import * as ReactDOMServer from 'react-dom/server';
import {Base} from '../../components/Base';
import {StaticRouter} from 'react-router-dom';

import {Provider} from 'react-redux';
import {store} from '../../store/store';

export const RenderComponent = (props: any) => <Provider store={store}>
    <StaticRouter context={{}}><Base>{props.children}</Base></StaticRouter>
</Provider>

