

import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, Route, browserHistory, IndexRoute} from "react-router";
import Base from "./components/Base";
import IndexPage from "./components/Index";
import Article, {ArticlePreview} from "./components/Article";
import Profile from "./components/profile/Profile";
// import Editor, {NewArticleEditor} from "./components/Editor";
import {Error404} from "./components/Error";
import ProfileManagement from "./components/profile/ProfileManagement";
import TwitterAuth from "./components/TwitterAuth";
import UrlShortener from "./components/UrlShortener";
import {UserAction, GET_ME} from "./actions/user/UserAction";
import "core-js/shim";
import LoginPage from "./components/LoginPage";

require.ensure(['./components/Editor.tsx'], () => {
    let Editor = require('./components/Editor.tsx');

    class App extends React.Component<any, any> {
        constructor(props: any) {
            super(props);
        }

        componentDidMount() {

            window.vkAsyncInit = function() {
                VK.init({
                  apiId: process.env.VK_APP
                });
            };

            setTimeout(function() {
                let el = document.createElement("script");
                el.type = "text/javascript";
                el.src = "//vk.com/js/api/openapi.js";
                el.async = true;
                document.getElementById("vk_api_transport").appendChild(el);
            }, 0);

            window.fbAsyncInit = function() {
                FB.init({
                    appId      : process.env.FB_APP,
                    xfbml      : true,
                    version    : 'v2.8'
                });
            }.bind(this);

            (function(d, s, id) {
              let js: any, fjs: any = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) return;
              js = d.createElement(s); js.id = id;
              js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.8";
              fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));

            function onGAPILoad() {
                try {
                    gapi.load('client:auth2', () => {

                        gapi.auth2.init({
                            client_id: process.env.GOOGLE_APP,
                            cookie_policy: 'single_host_origin',
                            scope: 'profile'
                        }).then(() => {
                            gapi.auth2.getAuthInstance();
                        }, () => {});
                    });
                } catch (e) {
                    window.setTimeout(onGAPILoad.bind(this), 0)
                }
            }
            window.setTimeout(onGAPILoad.bind(this), 0);
            UserAction.doAsync(GET_ME, null);
        }

        render() {
            return (
                <Router history={browserHistory}>
                    <Route path="/" component={Base}>
                        <IndexRoute component={IndexPage}/>
                        <Route path="login" component={LoginPage} />
                        <Route path="home/:id" component={IndexPage} />

                        <Route path="articles/new" component={(Editor as any)['NewArticleEditor']}/>
                        <Route path="articles/:articleId/edit" component={(Editor as any)['Editor']}/>
                        <Route path="articles/:articleId/preview" component={ArticlePreview}/>
                        <Route path="articles/:articleSlug" component={Article}/>
                        <Route path="manage" component={ProfileManagement}/>
                        <Route path="manage/:section" component={ProfileManagement}/>
                        <Route path="url_shorten" component={UrlShortener}/>
                        <Route path="auth/twitter/" component={TwitterAuth}/>

                        <Route path=":slug" component={Profile}/>
                        <Route path=":slug/:subsection" component={Profile}/>
                    </Route>
                    <Route path="*" component={() => {return <Error404/>}}/>
                </Router>
            )
        }
    }

    ReactDOM.render(<App/>, document.getElementById("app"));
});


