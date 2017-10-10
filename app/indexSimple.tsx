import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, withRouter} from "react-router";
import {Route, BrowserRouter, Switch} from 'react-router-dom';
import {Provider} from 'react-redux';
import {store} from './store/store';
import IndexPage from "./components/Index";

import Article, {ArticlePreview} from "./components/Article";
import ArticleFeed from "./components/ArticleFeed";
import Profile from "./components/profile/Profile";
import {Error404} from "./components/Error";
import "core-js/shim";
import Base from './components/BaseSimple';


class App extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return <Provider store={store}>
            <BrowserRouter>
                <Base>
                    <Switch>
                        <Route exact path="/" component={IndexPage}/>
                        <Route path="/articles/:articleId/preview" component={ArticlePreview}/>
                        <Route path="/articles/:articleSlug/gallery/:galleryBlockId" component={Article}/>
                        <Route path="/articles/:articleSlug" component={ArticleFeed}/>
                        <Route path="/:slug/:subsection" component={Profile}/>
                        <Route path="/:slug" component={Profile}/>
                        <Route component={Error404}/>
                    </Switch>
                </Base>
            </BrowserRouter>
        </Provider>
    }


}