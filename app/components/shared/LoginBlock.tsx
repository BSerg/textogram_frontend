import * as React from 'react';
import {UserAction, LOGIN, LOGOUT, GET_ME} from '../../actions/user/UserAction';

interface ILoginBlockStateInterface {
    isLogging?: boolean
}

export default class LoginBlock extends React.Component<any, ILoginBlockStateInterface> {

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
            })
        }, 4194304);
    }


    render() {
        return (
            <div className="login_block">
                <div onClick={this.login.bind(this, 'vk')}>vk</div>
                <div  onClick={this.login.bind(this, 'fb')}>fb</div>
                <div onClick={this.login.bind(this, 'twitter')}>twitter</div>
                <div  onClick={this.login.bind(this, 'google')}>google</div>
            </div>);
    }
}