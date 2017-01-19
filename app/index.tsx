import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Router, Route, Link, browserHistory, IndexRoute} from 'react-router';

import Base from './components/Base';
import IndexPage from './components/Index';
import Article from './components/Article';
import Profile from './components/Profile';
import Editor from './components/Editor';
import Error from './components/Error';
import ProfileManagement from'./components/ProfileManagement';
import Drafts from './components/Drafts';

import {UserAction, GET_ME} from './actions/user/UserAction';

import 'core-js/shim';

class App extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    componentDidMount() {
        UserAction.do(GET_ME, null);
    }

    render() {
        return (
            <Router history={browserHistory}>
                <Route path="/" component={Base}>
                    <IndexRoute component={IndexPage}/>

                    <Route path="home/:id" component={IndexPage} />
                    <Route path="profile/:userId" component={Profile}/>
                    <Route path="articles/:articleId/edit" component={Editor}/>
                    <Route path="articles/:articleSlug" component={Article}/>
                    <Route path="drafts" component={Drafts} />
                    <Route path="manage" component={ProfileManagement}/>
                </Route>
                <Route path="*" component={() => {return <Error code={404} msg="Page not found"/>}}/>
            </Router>
        )
    }
}

ReactDOM.render(<App/>, document.getElementById("app"));