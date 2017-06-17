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
        // this.state = { isLogging: false };
    }

    render() {
        function getOAuthLink(link: string, social: string) {
            let currentLocation: string;
            try {
                currentLocation = window.location.href;
            }
            catch (error) {
                currentLocation = 'https://textius.com';
            }

            return (
                <a target="_self" href={process.env.AUTH_SERVICE_URL + link + '?redirect_url=' + currentLocation} key={social}>
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