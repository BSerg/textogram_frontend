import * as React from 'react';
import * as moment from 'moment';
import {Captions, Constants} from '../constants';

import {UserAction, SAVE_USER, GET_ME, LOGIN, LOGOUT} from '../actions/user/UserAction';
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

const VisibilityIcon = require('babel!svg-react!../assets/images/profile_visibility_icon.svg?name=VisibilityIcon');
const VisibilityOffIcon = require('babel!svg-react!../assets/images/profile_visibility_off_icon.svg?name=VisibilityOffIcon');
const CloseIcon = require('babel!svg-react!../assets/images/close.svg?name=CloseIcon');

const BackIcon = require('babel!svg-react!../assets/images/back.svg?name=BackIcon');
const ConfirmIcon = require('babel!svg-react!../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');

import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from '../actions/shared/ModalAction';

import AvatarEditor from './shared/AvatarEditor';


import {api} from '../api';

interface ISectionPropsInterface {
    user: any
}

interface ISubscriptionsStateInterface {
    objects?: any[],
    objectsFiltered?: any[],
    filter?: string
}

class Subscriptions extends React.Component<ISectionPropsInterface, ISubscriptionsStateInterface> {

    constructor(props: any) {
        super(props);

        this.state = {objects: [], objectsFiltered: [], filter: ""}
    }

    removeSubscription(id: null | number = null) {
        if (id == null) return;

        api.post('/users/' + id + '/un_subscribe/').then((response: any) => {
            let indexToDelete: number;
            let indexToDeleteFiltered: number;
            this.state.objects.forEach((o: any, index: number) => {
                if (o.author.id == id) indexToDelete = index;
            });
            this.state.objectsFiltered.forEach((of: any, index: number) => {
                if (of.author.id == id) indexToDeleteFiltered = index;
            });
            let objects = this.state.objects;
            let objectsFiltered = this.state.objectsFiltered;
            if (indexToDelete != undefined) { objects.splice(indexToDelete, 1); }
            if (indexToDeleteFiltered != undefined) { objectsFiltered.splice(indexToDeleteFiltered, 1); }

            this.setState({objects: objects, objectsFiltered: objectsFiltered});
        });
    }

    load() {
        api.get('/subscriptions/').then((response: any) => {
            let objects = this.updateObjects(response.data);
            let objectsFiltered = this.updateObjects(response.data);
            this.setState({objects: objects, objectsFiltered: objectsFiltered});
        })
    }

    filterSubscriptions(e: any) {
        let filterText = e.target.value.toLowerCase();
        if (filterText == "") {
            this.setState({objectsFiltered: this.updateObjects(this.state.objects)});
        }
        else {
            let objectsFiltered: any[] = [];

            this.state.objects.forEach((o: any, index) => {
                if (o.userName.indexOf(filterText) != -1) objectsFiltered.push(o);
            });

            this.setState({objectsFiltered: objectsFiltered, filter: filterText});
        }
    }

    updateObjects(objects: any[]): any[] {

        return objects.map((o: any) => {
            o.userName = (o.author.first_name + ' ' + o.author.last_name).toLowerCase();
            return o;
        });
    }

    componentDidMount() {
        this.load()
    }

    render() {
        return (
            <div className="profile__subscriptions">
                {this.state.objectsFiltered.map((subscription, index) => {
                    return (
                        <div className="profile__subscription" key={index}>
                            <div className="avatar"><img src={subscription.author.avatar} /></div>
                            <div className="name">
                                <span>{subscription.author.first_name} </span> <span>{subscription.author.last_name}</span>
                            </div>
                            <div className="close_icon" onClick={this.removeSubscription.bind(this, subscription.author.id)}><CloseIcon /></div>
                        </div>)
                })}

                <div className="filter_input">
                    <input onChange={this.filterSubscriptions.bind(this)} type="text" placeholder={Captions.management.fastSearch} />
                </div>
            </div>);
    }
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

class AddLinkModal extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {urlValid: false, url: "", isError: false}
    }

    close() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    isUrl(s: string) {
        return s != "";
    }

    submitHandler(e: any) {
        e.preventDefault();
        if (this.state.url == "") return;
        api.post('/social_links/', {url: this.state.url, user: UserAction.getStore().user.id}).then((response: any) => {
            let socialLink = response.data;
            let social_links = UserAction.getStore().user.social_links || [];
            let contains = false;
            social_links.map((lnk: any) => {
                if (lnk.id == socialLink.id) contains = true;
            });
            if (!contains)  {
                social_links.push(socialLink);
                let user = UserAction.getStore().user;
                user.social_links = social_links;
                UserAction.do(SAVE_USER, user);
            }
            ModalAction.do(CLOSE_MODAL, null);

        }).catch((error) => {this.setState({isError: true})});
    }

    changeHandler(e: any) {
        let url = e.target.value;
        this.setState({urlValid: this.isUrl(url), url: url, isError: false});
    }

    render() {
        return (
            <div className="add_link_modal">
                <div className="button exit" onClick={this.close} ><BackIcon /></div>
                <div className={"link_form" + (this.state.isError ? " error" : "")}>
                    <form onChange={this.changeHandler.bind(this)} onSubmit={this.submitHandler.bind(this)}>
                        <input type="text" name="url" placeholder={Captions.management.linkAddPlaceholder} />
                    </form>
                    <div className="message">{this.state.isError ? Captions.management.linkAddError: Captions.management.linkAddText }</div>
                </div>
                <div className={'button submit ' + (this.state.urlValid ? 'active' : '')} onClick={this.submitHandler.bind(this)}>
                    <ConfirmIcon />
                </div>
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

    removeLink(id: number) {
        api.delete('/social_links/' + id + '/').then((response) => {
            let indexToRemove: number;
            let user = UserAction.getStore().user;
            user.social_links.forEach((socialLink: any, index: number) => {
                if (id == socialLink.id) indexToRemove = index;
            });
            if (indexToRemove != undefined) {
                user.social_links.splice(indexToRemove, 1);
                UserAction.do(SAVE_USER, user);
            }
        }).catch((error) => {});
    }

    toggleHidden(id: number) {
        api.post('/social_links/' + id + '/toggle_hidden/').then((response:any) => {
            let user = UserAction.getStore().user;
            user.social_links.forEach((socialLink: any, index: number) => {
                if (id == socialLink.id) user.social_links[index].is_hidden = response.data.is_hidden;
            });
            UserAction.do(SAVE_USER, user);
        }).catch((error) => {});
    }

    addLink() {
        ModalAction.do(OPEN_MODAL, {content: <AddLinkModal />});
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
                                <div className="eye" onClick={this.toggleHidden.bind(this, this.state.authLink.id)}>{ this.state.authLink.is_hidden ? <VisibilityOffIcon /> : <VisibilityIcon />}</div>
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
                            <div className="profile__link" key={index} onClick={this.removeLink.bind(this, link.id)}>
                                <div><SocialIcon social={link.social} /></div>
                                <div className="url">{ link.url }</div>
                                <div className="close_icon"><CloseIcon /></div>
                            </div>)
                    })
                }
                {
                    (!this.state.links.length) ? (
                        <div className="link_add_text">{Captions.management.addLinks}</div>
                    ) : null
                }
                <div className="profile__add_link">
                    <div className="line"></div>
                    <div className="button" onClick={this.addLink.bind(this)}>+</div>
                </div>
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
        { name: this.SECTION_SUBSCRIPTIONS, caption: Captions.management.sectionSubscriptions, icon: SubscriptionIcon, section: Subscriptions },
    ];

    refs: {
        inputAvatar: HTMLInputElement;
    };


    constructor() {
        super();
        this.state = this.getStateData();
        this.state.currentSection = 0;
        this.checkUser = this.checkUser.bind(this);
        this.userNameChange = this.userNameChange.bind(this);
        this.saveUserName = this.saveUserName.bind(this);
        this.avatarClick = this.avatarClick.bind(this);
        this.uploadAvatar = this.uploadAvatar.bind(this);
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
        this.setState(this.getStateData(), () => {
            this.uploadAvatar();
        });
    }

    userNameChange(content: string, contentText: string) {
        this.setState({userName: contentText});
    }

    saveUserName() {
        this.setState({userNameContent: this.getUserNameContent(this.state.userName)});
    }

    avatarClick() {
        this.refs.inputAvatar.click();
    }

    uploadAvatar() {
        // let file = this.refs.inputAvatar.files[0];
        // if (!file) return;
        // if (!file || (file.type != 'image/png' && file.type != 'image/jpeg')) {
        //     return;
        // }
        //
        // if (file.size > Constants.maxImageSize) {
        //     return;
        // }
        let _URL = window.URL;
        let img = new Image();
        let url = 'http://prikolnie-kartinki.ru/uploads/posts/2016-08/1472503377_prikolnye-kotiki-foto2.jpg';
        try {
            // img.src = _URL.createObjectURL(file);
            img.src = url;
        }
        catch (e) {
            return;
        }

        img.onload = () => {
            // console.log(img);
            let aspectRatio = (img.width / img.height);
            // console.log(aspectRatio);
            if ((aspectRatio < 0.5 || aspectRatio > 2) || (img.width < 150 || img.height < 150))  {
                return;
            }
            ModalAction.do(OPEN_MODAL, { content: <AvatarEditor image={img} />});

        }

    }

    componentDidMount() {
        UserAction.onChange(GET_ME, this.checkUser);
        UserAction.onChange(LOGIN, this.checkUser);
        UserAction.onChange(LOGOUT, this.checkUser);
        UserAction.onChange(SAVE_USER, this.checkUser);
    }

    componentWillUnmount() {
        UserAction.unbind(GET_ME, this.checkUser);
        UserAction.unbind(LOGIN, this.checkUser);
        UserAction.unbind(LOGOUT, this.checkUser);
        UserAction.unbind(SAVE_USER, this.checkUser);
    }

    render() {

        let CurrentSection = this.SECTIONS[this.state.currentSection] ? (this.SECTIONS[this.state.currentSection].section): null;

        if (this.state.error) return (this.state.error);
        return (
            <div id="profile_management">
                <Header>{Captions.management.title}</Header>
                <div className="profile__avatar" onClick={this.avatarClick} >
                    <input type="file" style={{display: 'none'}} ref="inputAvatar" onChange={this.uploadAvatar}/>
                    <img src={this.state.user.avatar} />
                </div>
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