import * as React from 'react';

import '../styles/profile.scss';

import {api} from '../api';

import Error from './Error';
import {UserAction} from "../actions/user/UserAction";

const VKIcon = require('babel!svg-react!../assets/images/profile_social_icon_vk.svg?name=VKIcon');
const FBIcon = require('babel!svg-react!../assets/images/profile_social_icon_fb.svg?name=FBIcon');


interface ISocialLinksProps {
    social_links: any[];
    is_self?: boolean;

}

class SocialLinks extends React.Component<ISocialLinksProps, any> {

    ICONS: any = {
        'vk': VKIcon,
        'fb': FBIcon,
        'facebook': FBIcon
    };

    componentDidMount() {}

    getIcon(social: string) {
        console.log('iconzez');
        console.log(this.ICONS[social]);
        return <div>{social}</div>;
    }

    render() {
        return (
            <div className="profile_social_links">
                { this.props.social_links.map((social_link: any, index: number) => {
                    return (<div key={ index }>{this.getIcon.bind(social_link.social)}</div>)
                }) }
            </div>);
    }
}

class ProfileAvatar extends React.Component<any, any> {
    render() {
        return (<div></div>);
    }
}


interface IProfileState {
    user?: any;
    error?: any;
    isSelf?: boolean;
}

export default class Profile extends React.Component<any, IProfileState> {


    constructor(props: any) {
        super(props);
    }

    getUserData(userId: string) {
        api.get('/users/' + userId + '/').then((response: any) => {
            let isSelf =  UserAction.getStore().user && UserAction.getStore().user.id == response.data.id;
            this.setState({user: response.data, isSelf: isSelf}, () => {
                console.log(this.state.user);
            });
        }).catch((error) => {
            this.setState({error: <Error code={404} msg="page not found" /> });
        })
    }

    componentWillReceiveProps(nextProps: any) {
        this.getUserData(nextProps.params.userId);
    }

    componentDidMount() {
        this.getUserData(this.props.params.userId);
    }

    render() {
        if (this.state && this.state.error) {
            return (this.state.error);
        }
        return (
            <div className="profile">

                 <div id="profile_content">
                    {
                        this.state && this.state.user ? [
                            <div  className="profile_header" key="header"></div>,
                            <div className="profile_avatar" key="avatar">
                                <img src={this.state.user.avatar}/>
                            </div>,

                            <div key="username" className="profile_username">
                                <span>{this.state.user.first_name}</span> <span> {this.state.user.last_name}</span>
                            </div>,



                        ] : null
                    }
                </div>
            </div>
        )
    }
}