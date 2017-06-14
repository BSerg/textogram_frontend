import * as React from 'react';
import {UserAction, LOGIN, LOGOUT, GET_ME} from '../../actions/user/UserAction';
import SocialIcon from './SocialIcon';
import '../../styles/shared/login_block.scss';
import {api} from '../../api';

interface ILoginBlockStateInterface {
    isLogging?: boolean
}

export default class LoginBlock extends React.Component<any, ILoginBlockStateInterface> {

    SOCIALS = ["vk", "fb", "twitter", "google"];

    constructor() {
        super();
        this.state = { isLogging: false };
        this.__onTwitterAuth = this.__onTwitterAuth.bind(this);
        // this.login = this.login.bind(this);
    }

    login(social: string, e: any) {
        e.stopPropagation();
        if (this.state.isLogging) return;
        // console.log(social);
        this.setState({isLogging: true}, () => {
            if (social == 'vk') this.__loginVK();
            else if (social == 'fb') this.__loginFB();
            else if (social == 'google') this.__loginGoogle();
            else if (social == 'twitter') this.__loginTwitter();

        });
    }

    __loginVK() {
        VK.Auth.login((response: any) => {
            let data = response.session;
            if (response.status == 'connected') {
                data.social = 'vk';
                // console.log(data);
                VK.api('users.get', {access_token: response.session.sid, fields: 'photo_100,email'}, (userData) => {
                    data.user.avatar = userData.response[0].photo_100;
                    // console.log(data);
                    UserAction.do(LOGIN, data);
                })
            }
            else {
                this.setState({isLogging: false});
            }

        }, 4194304);
    }

    __loginFB() {
        FB.login((response: any) => {
            if (response.status == 'connected') {
                let data: any = response.authResponse;
                data.social = 'fb';
                UserAction.do(LOGIN, data);
            }
            else {
                this.setState({isLogging: false});
            }
        }, {return_scopes: true, scope: 'email' });

    }

    __loginGoogle() {
        let authInstance = gapi.auth2.getAuthInstance();
        authInstance.signIn({'scope': ''}).then((response: any) => {
            let data: any = response.getAuthResponse();
            let authData = { social: 'google', id_token: data.id_token };
            UserAction.do(LOGIN, authData);
        }, (error: any) => { this.setState({isLogging: false}) });
    }

    __loginTwitter() {
       api.post('auth/twitter/', {url: window.location.origin}).then((response: any) => {
           // console.log(response);
           let oauthToken = response.data.oauth_token;
           window.open('https://api.twitter.com/oauth/authenticate?oauth_token=' + oauthToken);
       }).catch(() => { this.setState({isLogging: false}) });
    }

    __onTwitterAuth() {
        let twitterData = localStorage.getItem('twitter_auth_data');
        if (!twitterData || UserAction.getStore().user) return;
        var data = JSON.parse(twitterData);
        data.social = 'twitter';
        localStorage.removeItem('twitter_auth_data');
        UserAction.do(LOGIN, data)
    }

    componentDidMount() {
        window.addEventListener('storage', this.__onTwitterAuth);
    }

    componentWillUnount() {
        window.removeEventListener('storage', this.__onTwitterAuth);
    }


    _render() {
        return (
            <div className="login_block">
                {
                    this.SOCIALS.map((social, index) => {
                        return (
                            <div key={index} onClick={this.login.bind(this, social)}>
                                <SocialIcon social={social} />
                            </div>)
                    })
                }
            </div>);
    }

    render() {
        function getOAuthLink(link: string, social: string) {
            let currentLocation = window.location.href;
            return (
                <a target="_self" href={process.env.AUTH_SERVICE_URL + link + '?redirect_url=' + currentLocation}>
                    <SocialIcon social={social}/>
                </a>
            )
        }
        return (
            <div className="login_block">
                {[
                    getOAuthLink('/oauth/vk', 'vk'),
                    getOAuthLink('/oauth/facebook', 'fb'),
                    getOAuthLink('/oauth/twitter', 'twitter'),
                    getOAuthLink('/oauth/google', 'google')
                ]}
            </div>);
    }
}