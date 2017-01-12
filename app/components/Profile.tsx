import * as React from 'react';

import {Link} from 'react-router';

import '../styles/common.scss';
import '../styles/profile.scss';

import {api} from '../api';

import Header from './shared/Header';
import Error from './Error';
import {UserAction, GET_ME, LOGIN, LOGOUT} from "../actions/user/UserAction";

const VKIcon = require('babel!svg-react!../assets/images/profile_social_icon_vk.svg?name=VKIcon');
const FBIcon = require('babel!svg-react!../assets/images/profile_social_icon_fb.svg?name=FBIcon');


interface ISocialLinkProps {
    social_link: any;
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
        this.state = {user: null, error: null, isSelf: false};
        this.checkIsSelf = this.checkIsSelf.bind(this);
    }

    checkIsSelf() {
        let isSelf: boolean =  Boolean(this.state.user && UserAction.getStore().user && UserAction.getStore().user.id == this.state.user.id);
        this.setState({ isSelf: isSelf });
    }

    getUserData(userId: string) {
        this.setState({error: null}, () => {
            api.get('/users/' + userId + '/').then((response: any) => {
                this.setState({user: response.data}, () => {
                    this.checkIsSelf();

                });
            }).catch((error) => {
                this.setState({error: <Error code={404} msg="page not found" /> });
            });
        });
    }

    subscribe() {
        api.post('/users/' + this.state.user.id + '/subscribe/').then((response) => {
            this.setIsSubscribed(true);
        }).catch((error) => {});
    }

    unSubscribe() {
        api.post('/users/' + this.state.user.id + '/un_subscribe/').then((response) => {
            this.setIsSubscribed(false);
        }).catch((error) => {})
    }

    setIsSubscribed(is_subscribed: boolean) {
        let user = this.state.user;
        user.is_subscribed = is_subscribed;
        user.subscribers += is_subscribed ? 1: -1;
        if (user.subscribers < 0) user.subscribers = 0;
        this.setState({user: user});
    }

    componentWillReceiveProps(nextProps: any) {
        this.getUserData(nextProps.params.userId);
    }

    componentDidMount() {
        this.getUserData(this.props.params.userId);
        UserAction.onChange(GET_ME, this.checkIsSelf);
        UserAction.onChange(LOGIN, this.checkIsSelf);
        UserAction.onChange(LOGOUT, this.checkIsSelf);
    }

    componentWillUnmount() {
        UserAction.unbind(GET_ME, this.checkIsSelf);
        UserAction.unbind(LOGIN, this.checkIsSelf);
        UserAction.unbind(LOGOUT, this.checkIsSelf);
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
                            <Header key="header"/>,
                            <div className="profile__avatar" key="avatar">
                                <img src={this.state.user.avatar}/>
                            </div>,

                            <div key="username" className="profile__username">
                                <div>
                                    <span>{this.state.user.first_name}</span> <span> {this.state.user.last_name}</span>
                                </div>
                            </div>,

                            <div key="subscription" className="profile__subscription">
                                <div>{ this.state.user.subscribers }</div>

                                {
                                    (!this.state.isSelf && UserAction.getStore().user) ?
                                        <div>
                                            { this.state.user.is_subscribed ?
                                                <div onClick={this.unSubscribe.bind(this)}>unsubscribe</div> :
                                                <div onClick={this.subscribe.bind(this)}>subscribe</div> }
                                        </div> : null
                                }
                            </div>,

                            <div className="profile__social_links" key="social_links">
                                { this.state.user.social_links.map((social_link: any, index: number) => {
                                    return <SocialLink social_link={ social_link } key={ index }/>
                                }) }
                            </div>,
                            <div key="isself">{ this.state.isSelf ? "self" : "not self" }</div>

                        ] : null
                    }
                </div>
            </div>
        )
    }
}