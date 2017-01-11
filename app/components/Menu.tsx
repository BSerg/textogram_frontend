import * as React from 'react';
import {withRouter} from 'react-router';

import {MenuAction, TOGGLE} from '../actions/MenuAction';
import {UserAction, GET_ME, LOGIN, LOGOUT} from '../actions/user/UserAction';
import {NotificationAction, CHECK} from '../actions/NotificationAction'

import {Captions} from '../constants';

import '../styles/menu.scss';

const ExitIcon = require('babel!svg-react!../assets/images/exit-icon.svg?name=ExitIcon');
const InfoIcon = require('babel!svg-react!../assets/images/info-icon.svg?name=InfoIcon');
const NotificationIcon = require('babel!svg-react!../assets/images/notification_icon.svg?name=NotificationIcon');

class DefaultMenu extends React.Component<any, any> {
    render() {
        return (
            <div>
                <div className="menu__login_title"></div>
                <div className="menu__login"></div>
                <div className="menu__about">
                    <div>о проекте</div>
                    <InfoIcon />
                </div>
            </div>);
    }
}


class NotificationBlock extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {count: 0, last: null};
        this.checkNotifications = this.checkNotifications.bind(this);
    }

    checkNotifications() {
        this.setState({ count: NotificationAction.getStore().count, last: NotificationAction.getStore().last });
    }

    componentDidMount() {
        this.checkNotifications();
        NotificationAction.onChange(CHECK, this.checkNotifications);
    }

    componentWillUnmount() {
        NotificationAction.unbind(CHECK, this.checkNotifications);
    }

    render() {
        if (!this.state.count || ! this.state.last) return null;
        return (
            <div className="menu__notifications">
                <div className="menu__notifications_icon">
                    <NotificationIcon />
                    <div className="menu__notifications_count">{ this.state.count < 10 ? this.state.count : '9+'}</div>
                </div>
                <div className="menu__notifications_text">{ (this.state.last && this.state.last.text) ? this.state.last.text : Captions.main_menu.notification_defaul_text }</div>
            </div>)
    }
}

let NotificationBlockWithRouter = withRouter(NotificationBlock);

interface IUserMenuProps {
    user: any;
    router?: any;
}

class UserMenu extends React.Component<IUserMenuProps, any> {

    constructor(props: any) {
        super(props)
    }

    goToProfile(e: any) {
        e.stopPropagation();
        this.props.router.push('/profile/' + this.props.user.id);
        MenuAction.do(TOGGLE, false);
    }

    logout(e: any) {
        e.stopPropagation();
        UserAction.do(LOGOUT, null);
        MenuAction.do(TOGGLE, null);
    }

    handleUrlClick(url: string, e: any) {
        e.stopPropagation();
        this.props.router.push(url);
        MenuAction.do(TOGGLE, false);
    }

    render() {
        return (
            <div>
                <div className="menu__controls">
                    <div onClick={this.handleUrlClick.bind(this, '/info/')} ><InfoIcon /></div>
                    <div onClick={this.logout.bind(this)}><ExitIcon /></div>
                </div>
                <div className="menu__user" onClick={this.goToProfile.bind(this)}>
                    <div className="menu__user_avatar">
                        <img src={ this.props.user.avatar } />
                    </div>
                    <div className="menu__user_username"><span>{this.props.user.first_name}</span> <span>{this.props.user.last_name}</span></div>
                </div>
                <NotificationBlockWithRouter />
                <div className="menu__links">
                    <div className="menu__link" onClick={this.handleUrlClick.bind(this, '/manage/')}>{ Captions.main_menu.manage_profile }</div>
                    <div className="menu__link" onClick={this.handleUrlClick.bind(this, '/articles/new/')}>{ Captions.main_menu.create_article }</div>
                    <div className="menu__link" onClick={this.handleUrlClick.bind(this, '/drafts/')}>{ Captions.main_menu.drafts }</div>
                </div>
            </div>)
    }
}

let UserMenuWithRouter = withRouter(UserMenu);


interface IMenuStateInterface {
    open?: boolean
    user?: any
}

export default class Menu extends React.Component<any, IMenuStateInterface> {

    constructor() {
        super();
        this.state = {open: true, user: UserAction.getStore().user}
        this.setUser = this.setUser.bind(this);
        this.setOpen = this.setOpen.bind(this);
    }

    setUser() {
        this.setState({user: UserAction.getStore().user});
    }

    toggleMenu() {
        MenuAction.do(TOGGLE, false);
    }

    setOpen() {
        this.setState({open: Boolean(MenuAction.getStore().open)});
    }

    componentDidMount() {
        MenuAction.onChange(TOGGLE, this.setOpen);
        UserAction.onChange(GET_ME, this.setUser);
        UserAction.onChange(LOGIN, this.setUser);
        UserAction.onChange(LOGOUT, this.setUser);
    }

    componentWillUnmount() {
        MenuAction.unbind(TOGGLE, this.setOpen);
        UserAction.unbind(GET_ME, this.setUser);
        UserAction.unbind(LOGIN, this.setUser);
        UserAction.unbind(LOGOUT, this.setUser);
    }

    render() {

        if (!this.state.open) return null;
        return (
            <div id="main_menu" onClick={this.toggleMenu}>
                { this.state.user ? <UserMenuWithRouter user={this.state.user} /> : <DefaultMenu /> }

            </div>);
    }
}