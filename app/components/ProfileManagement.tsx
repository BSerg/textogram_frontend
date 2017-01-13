import * as React from 'react';
import * as moment from 'moment';
import {Captions} from '../constants';

import {UserAction, GET_ME, LOGIN, LOGOUT} from '../actions/user/UserAction';
import {NotificationAction, CHECK} from '../actions/NotificationAction';

import Error from './Error';
import Header from './shared/Header';
import ContentEditable from './shared/ContentEditable';
import SocialIcon from './shared/SocialIcon';

import '../styles/common.scss';
import '../styles/profile_management.scss';

const ConnectionIcon = require('babel!svg-react!../assets/images/profile_connection_icon.svg?name=ConnectionIcon');
const LoginIcon = require('babel!svg-react!../assets/images/profile_login_icon.svg?name=LoginIcon');
const NotificationIcon = require('babel!svg-react!../assets/images/profile_notification_icon.svg?name=NotificationIcon');
const SubscriptionIcon = require('babel!svg-react!../assets/images/profile_subscription_icon.svg?name=SubscriptionIcon');

const VisibilityIcon = require('babel!svg-react!../assets/images/profile_visibility_off_icon.svg?name=VisibilityIcon');
const VisibilityOffIcon = require('babel!svg-react!../assets/images/profile_visibility_off_icon.svg?name=VisibilityOffIcon');
const CloseIcon = require('babel!svg-react!../assets/images/profile_close_icon.svg?name=CloseIcon');


import {api} from '../api';

interface ISectionPropsInterface {
    user: any
}

interface INotificationsStateInterface {
    notifications?: any[],
    apiUrl?: string,
    hasNew?: boolean,
}

class Notifications extends React.Component<ISectionPropsInterface, INotificationsStateInterface> {

    INITIAL_API_URL = '/notifications/';

    constructor(props: any) {
        super(props);
        this.state = {notifications: [], apiUrl: this.INITIAL_API_URL, hasNew: false};
        this.checkNew = this.checkNew.bind(this);
    }

    load(initial: boolean = false) {
        if (!initial && !this.state.apiUrl) return;
        api.get(initial ? this.INITIAL_API_URL : this.state.apiUrl).then((response: any) => {
            let results = response.data.results || [];
            results = results.map((data: any) => { return this.updateData(data); });
            let notifications = initial ? results : this.state.notifications.concat(results);
            this.setState({notifications: notifications, apiUrl: response.data.next});
            if (initial) {
                api.post('/notifications/mark_read_all/').then((response) => {
                    NotificationAction.do(CHECK, null);
                });
            }
        }).catch((error: any) => {});
    }

    updateData(data: any) {
        data.dateText = moment(data.date).format('DD.MM.YYYY, HH:mm') || '';
        return data;
    }

    checkNew() {
        this.setState({hasNew: Boolean(NotificationAction.getStore().count)})
    }

    componentDidMount() {
        this.load(true);
        NotificationAction.onChange(CHECK, this.checkNew);

    }

    componentWillUnmount() {
        NotificationAction.unbind(CHECK, this.checkNew);
    }

    render() {
        return (

            <div className="profile__section">
                {
                    this.state.hasNew ? <div className="load_more" onClick={this.load.bind(this, true)}>+</div> : null
                }
                {
                    this.state.notifications.map((notification, index) => {
                        return (<div className="profile__notification" key={index}>
                            <div className="time">
                                { notification.dateText }
                            </div>
                            <div className="text">{ notification.text }</div>
                        </div>)
                    })
                }
                {
                    this.state.apiUrl ? <div className="load_more" onClick={this.load.bind(this, false)}>+</div> : null
                }
            </div>)
    }
}

interface ISectionLinksStateInterface {
    links: any[];
    authLink?: any;
}


class SocialLinks extends React.Component<ISectionPropsInterface, ISectionLinksStateInterface> {
    constructor(props: any) {
        super(props);
        this.state = {links: [], authLink: null};
    }

    setLinks(props: any) {
        let links: any[] = (props.user && props.user.social_links) ? props.user.social_links : [];
        let authLink = (links[0] && links[0].is_auth) ? links[0] : null;

        this.setState({links: authLink ? links.slice(1, links.length) : links, authLink: authLink});
    }

    componentWillReceiveProps(nextProps: any) {
        this.setLinks(nextProps);
    }

    componentDidMount() {
        this.setLinks(this.props);
    }

    render() {
        return (
            <div className="profile__section">
                {
                    this.state.authLink ? (
                        <div className="profile__auth_link">
                            <div className="link_text">{Captions.management.authAccount}</div>
                            <div className="profile__link">
                                <div><SocialIcon social={this.state.authLink.social} /></div>
                                <div className="url">{ this.state.authLink.url }</div>
                                <div>{ this.state.authLink.is_hidden ? <VisibilityOffIcon /> : <VisibilityIcon />}</div>
                            </div>
                        </div>
                    ) : null
                }
                {
                    (this.state.authLink && this.state.links.length) ? (<div className="link_text">{Captions.management.additionalLinks}</div>) : null
                }
                {
                    this.state.links.map((link, index) => {
                        return (
                            <div className="profile__link" key={index}>
                                <div><SocialIcon social={link.social} /></div>
                                <div className="url">{ link.url }</div>
                                <div><CloseIcon /></div>
                            </div>)
                    })
                }
                {
                    (!this.state.authLink && !this.state.links.length) ? (
                        <div className="link_add_text">{Captions.management.addLinks}</div>
                    ) : null
                }


            </div>);
    }
}


interface IProfileManagementState {
    user?: any,
    error?: any,
    userName?: null | string,
    userNameContent?: null | string,
    currentSection?: number,
}

export default class ProfileManagement extends React.Component<any, IProfileManagementState> {

    SECTION_LINKS:string = 'links';
    SECTION_LOGIN:string = 'login';
    SECTION_NOTIFICATIONS:string = 'notifications';
    SECTION_SUBSCRIPTIONS:string = 'subscriptions';

    SECTIONS: { name: string, caption: string, icon: any, section: any }[] = [

        { name: this.SECTION_LINKS, caption: Captions.management.sectionLinks, icon: ConnectionIcon, section: SocialLinks },
        { name: this.SECTION_LOGIN, caption: Captions.management.sectionLogin, icon: LoginIcon, section: null },
        { name: this.SECTION_NOTIFICATIONS, caption: Captions.management.sectionNotifications, icon: NotificationIcon, section: Notifications },
        { name: this.SECTION_SUBSCRIPTIONS, caption: Captions.management.sectionSubscriptions, icon: SubscriptionIcon, section: null },
    ];


    constructor() {
        super();
        this.state = this.getStateData();
        this.state.currentSection = 3;
        this.checkUser = this.checkUser.bind(this);
        this.userNameChange = this.userNameChange.bind(this);
        this.saveUserName = this.saveUserName.bind(this);
    }

    setSection(index: number) {
        if (this.SECTIONS[index] && index != this.state.currentSection) this.setState({currentSection: index});
    }

    getStateData(): IProfileManagementState {
        let user = UserAction.getStore().user;
        let userName = user ?user.first_name + " " + user.last_name : "";
        let userNameContent = this.getUserNameContent(userName);
        return {
            user: user,
            userName: userName,
            userNameContent: userNameContent,
            error: user ? null : <Error code={404} msg="page not found" /> };
    }

    getUserNameContent(userName: string): string {
        userName = userName.replace(/\s\s+/g, ' ');
        let arr = userName.split(" ");
        let first: string;
        let rest: string;
        if (arr.length <= 1) {
            first = userName;
            rest = "";
        }
        else {
            first = arr.splice(0, 1).join("");
            rest = arr.join(" ");
        }
        return "<div class='editable'>" + "<span>" + first + " </span>" + "<span>" + rest + "</span>" + "</div>";
    }

    checkUser() {
        this.setState(this.getStateData);
    }

    userNameChange(content: string, contentText: string) {
        this.setState({userName: contentText});
    }

    saveUserName() {
        this.setState({userNameContent: this.getUserNameContent(this.state.userName)});
    }

    componentDidMount() {
        UserAction.onChange(GET_ME, this.checkUser);
        UserAction.onChange(LOGIN, this.checkUser);
        UserAction.onChange(LOGOUT, this.checkUser);
    }

    componentWillUnmount() {
        UserAction.unbind(GET_ME, this.checkUser);
        UserAction.unbind(LOGIN, this.checkUser);
        UserAction.unbind(LOGOUT, this.checkUser);
    }

    render() {

        let CurrentSection = this.SECTIONS[this.state.currentSection] ? (this.SECTIONS[this.state.currentSection].section): null;

        if (this.state.error) return (this.state.error);
        return (
            <div id="profile_management">
                <Header>{Captions.management.title}</Header>
                <div className="profile__avatar"><img src={this.state.user.avatar}/></div>
                <div className="profile__username">
                    <ContentEditable
                        elementType="inline"
                        allowLineBreak={false}
                        placeholder={Captions.management.usernamePlaceholder}
                        alignContent="center"
                        onChange={this.userNameChange}
                        onBlur={this.saveUserName}
                        content={ this.state.userNameContent } />
                </div>

                <div className="profile__menu">
                    { this.SECTIONS.map((section, index) => {
                        return (
                            <div className={"profile__menu_section" + (index == this.state.currentSection ? ' active' : '')}
                                 key={"section" + index.toString() }
                                 onClick={this.setSection.bind(this, index)}>
                                {section.icon ? (<section.icon />) : null}
                                <span>{ section.caption }</span>
                            </div>)
                    }) }
                </div>
                { CurrentSection ? <CurrentSection user={ this.state.user } /> : null}
            </div>);
    }
}