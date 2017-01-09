import * as React from 'react';

import {Link} from 'react-router';

import '../styles/profile.scss';

import {api} from '../api';

import Error from './Error';
import {UserAction} from "../actions/user/UserAction";

const VKIcon = require('babel!svg-react!../assets/images/profile_social_icon_vk.svg?name=VKIcon');
const FBIcon = require('babel!svg-react!../assets/images/profile_social_icon_fb.svg?name=FBIcon');


interface ISocialLinkProps {
    social_link: any;
    is_self?: boolean;
}

class SocialLink extends React.Component<ISocialLinkProps, any> {

    ICONS: any = {
        'vk': VKIcon,
        'fb': FBIcon,
        'facebook': FBIcon
    };

    getIcon(social: string) {
        let Icon = this.ICONS[social];
        return Icon ? <Icon /> : null;
    }

    handleClick() {
        console.log(this.props.social_link.url);
    }

    render() {
        let Icon = this.ICONS[this.props.social_link.social];
        return (
            <div className={ Icon ? "profile__social_icon" : "" }>
                { Icon ? <Link to={this.props.social_link.url} target="_blank" ><Icon /></Link> : null }
            </div>)
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
                            <div  className="profile__header" key="header"></div>,
                            <div className="profile__avatar" key="avatar">
                                <img src={this.state.user.avatar}/>
                            </div>,

                            <div key="username" className="profile__username">
                                <span>{this.state.user.first_name}</span> <span> {this.state.user.last_name}</span>
                            </div>,

                            <div className="profile__social_links" key="social_links">
                                { this.state.user.social_links.map((social_link: any, index: number) => {
                                    return <SocialLink social_link={ social_link } key={ index }/>
                                }) }
                            </div>

                        ] : null
                    }
                </div>
            </div>
        )
    }
}