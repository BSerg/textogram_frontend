import * as React from 'react';
import {UserAction, LOGIN, LOGOUT, GET_ME} from '../../actions/user/UserAction';
import SocialIcon from './SocialIcon';
import '../../styles/shared/login_block.scss';

interface ILoginBlockStateInterface {
    isLogging?: boolean
}

export default class LoginBlock extends React.Component<any, ILoginBlockStateInterface> {

    SOCIALS = ["vk", "fb", "twitter", "google"];

    constructor() {
        super();
        this.state = { isLogging: false };
        // this.login = this.login.bind(this);
    }

    login(social: string, e: any) {
        e.stopPropagation();
        if (this.state.isLogging) return;
        console.log(social);
        this.setState({isLogging: true}, () => {
            if (social == 'vk') this.__loginVK();
            else if (social == 'fb') this.__loginFB();

        });
    }

    __loginVK() {
        VK.Auth.login((response: any) => {
            console.log(response);
            let data = response.session;
            data.social = 'vk';
            console.log(data);
            VK.api('users.get', {access_token: response.session.sid, fields: 'photo_100'}, (userData) => {
                data.user.avatar = userData.response[0].photo_100;
                console.log(data);
                UserAction.do(LOGIN, data);
            })
        }, 4194304);
    }

    __loginFB() {
        FB.login((response: any) => {
            if (response.status == 'connected') {
                let data: any = response.authResponse;
                data.social = 'fb';
                UserAction.do(LOGIN, data);
            }
           console.log(response);
        });

    }


    render() {
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
                {/*<div onClick={this.login.bind(this, 'vk')}>vk</div>*/}
                {/*<div  onClick={this.login.bind(this, 'fb')}>fb</div>*/}
                {/*<div onClick={this.login.bind(this, 'twitter')}>twitter</div>*/}
                {/*<div  onClick={this.login.bind(this, 'google')}>google</div>*/}
            </div>);
    }
}