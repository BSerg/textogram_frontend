import * as cookie from 'js-cookie';
import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, withRouter} from "react-router";
import {Route, BrowserRouter, Switch} from 'react-router-dom';
import Base from "./components/Base";
import IndexPage from "./components/Index";
import Article, {ArticlePreview} from "./components/Article";
import ArticleFeed from "./components/ArticleFeed";
import Profile from "./components/profile/Profile";
import Editor, {NewArticleEditor} from "./components/Editor";
import {Error404} from "./components/Error";
import ProfileManagement from "./components/profile/ProfileManagement";
import TwitterAuth from "./components/TwitterAuth";
import UrlShortener from "./components/UrlShortener";
// import {UserAction, GET_ME, LOGIN, USER_REJECT} from "./actions/user/UserAction";
import "core-js/shim";
import LoginPage from "./components/LoginPage";
import {Provider} from 'react-redux';
import {store} from './store/store';



class App  extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }


    componentDidMount() {

        /*let token = cookie.get('jwt') || window.localStorage.getItem('authToken')
        if (token) {
            UserAction.doAsync(LOGIN, {token: token});
        }
        else {
            UserAction.do(USER_REJECT, null);
        }*/
    }

    render() {
        return (
            <Provider store={store}>
            <BrowserRouter>
                <Base>
                    <Switch>
                        <Route exact path="/" component={IndexPage}/>
                        <Route path="/login" component={LoginPage} />
                        <Route path="/manage/:section" component={ProfileManagement}/>
                        <Route path="/manage" component={ProfileManagement}/>
                        <Route path="/url_shorten" component={UrlShortener}/>
                        <Route path="/auth/twitter/" component={TwitterAuth}/>
                        <Route path="/articles/new" component={NewArticleEditor}/>
                        <Route path="/articles/:articleId/edit" component={Editor}/>
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
        )
    }
}


// class App extends React.Component<any, any> {
//     render() {
        {/*return (<div></div>);*/}
    // }
// }

ReactDOM.render(<App/>, document.getElementById("app"));


