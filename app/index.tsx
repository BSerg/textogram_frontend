import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Router, Route, Link, browserHistory, IndexRoute} from 'react-router';

import Base from './components/Base';
import Index from './components/Index';
import Article from './components/Article';
import Profile from './components/Profile';
import Editor from './components/Editor';
import Error from './components/Error';

import 'core-js/shim';

class App extends React.Component<any, any> {
    render() {
        return (
            <Router history={browserHistory}>
                <Route path="/" component={Base}>
                    <IndexRoute component={Index}/>
                    <Route path="profile/:userId" component={Profile}/>
                    <Route path="articles/:articleId/edit" component={Editor}/>
                    <Route path="articles/:articleSlug" component={Article}/>
                </Route>
                <Route path="*" component={() => {return <Error code={404} msg="Page not found"/>}}/>
            </Router>
        )
    }
}

ReactDOM.render(<App/>, document.getElementById("app"));