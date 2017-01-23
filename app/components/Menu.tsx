import * as React from 'react';
import {withRouter} from 'react-router';

import {MenuAction, TOGGLE} from '../actions/MenuAction';
import {UserAction, GET_ME, LOGIN, LOGOUT, SAVE_USER} from '../actions/user/UserAction';
import {NotificationAction, CHECK} from '../actions/NotificationAction'
import {ModalAction, OPEN_MODAL} from '../actions/shared/ModalAction';
import Registration from './Registration';
import {Captions} from '../constants';
import LoginBlock from './shared/LoginBlock';

import '../styles/menu.scss';

const ExitIcon = require('babel!svg-react!../assets/images/exit-icon.svg?name=ExitIcon');
const InfoIcon = require('babel!svg-react!../assets/images/info-icon.svg?name=InfoIcon');
const NotificationIcon = require('babel!svg-react!../assets/images/notification_icon.svg?name=NotificationIcon');


interface IDefaultmenuStateInterface {
    phone?: string;
    password?: string;
    patternInputPhone?: any;
    patternPhone?: any;
    loginError?: string;

}

class DefaultMenu extends React.Component<any, IDefaultmenuStateInterface> {

    constructor() {
        super();
        let patternInputPhone = new RegExp('^\\' + this.getInitialCode() + '\\d{0,10}$');
        let patternPhone = new RegExp('^\\' + this.getInitialCode() + '\\d{1,10}$');
        this.state = {
            phone: this.getInitialCode(), password: '', patternInputPhone: patternInputPhone,
            patternPhone: patternPhone, loginError: null
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    getInitialCode() {
        return '+7';
    }

    stopClose(e: any) {
        e.stopPropagation();
    }

    handleSubmit(e: any) {
        e.preventDefault();
        this.loginPhone();
    }

    loginPhone() {
        if (this.state.phone.length < 3) return;
        let data: any = {phone: this.state.phone.substring(1), password: this.state.password};
        UserAction.doAsync(LOGIN, data).catch((error) => { this.setState({loginError: 'error'}); });
    }

    phoneChange(e: any) {
        let phone = e.target.value;
        if (phone.match(this.state.patternInputPhone))
            this.setState({phone: phone, loginError: null});
    }

    passwordChange(e: any) {
        let password = e.target.value;
        this.setState({password: password, loginError: null});
    }

    handleUrlClick(url: string) {

    }

    registration(isForgotPassword: boolean = false) {
        ModalAction.do(OPEN_MODAL, {content: <Registration isForgotPassword={isForgotPassword} />});
        MenuAction.do(TOGGLE, false);
    }

    render() {
        return (
            <div className="menu__content main__menu_default" >
                <div onClick={this.stopClose}>
                    <div className="menu__controls">
                        <div onClick={this.handleUrlClick.bind(this, '/info/')} ><InfoIcon /></div>
                    </div>
                    <div className="menu__login_title">{Captions.main_menu.title}</div>
                    <div className="menu__login">
                        <form onSubmit={this.handleSubmit} className={this.state.loginError ? 'error': null}>
                            <div className="login_element">
                                <input type="text"
                                       name="phone"
                                       placeholder={Captions.main_menu.inputPhonePlaceholder}
                                       value={this.state.phone} onChange={this.phoneChange.bind(this)}/>
                                <div className="hint"><span>{Captions.main_menu.loginHint}</span></div>
                            </div>
                            <div className="login_element">
                                <input type="password" name="pwd"
                                       placeholder={Captions.main_menu.inputPasswordPlaceholder}
                                       value={this.state.password} onChange={this.passwordChange.bind(this)}/>
                                <div className="hint">
                                    <span>{Captions.main_menu.passwordHint}</span>
                                    <span className="forgot_password" onClick={this.registration.bind(this, true)}>
                                        {Captions.main_menu.forgotPassword}
                                    </span>
                                </div>
                            </div>
                            <button style={{position: 'absolute', opacity: 0}} type="submit">1</button>
                        </form>
                    </div>
                    <div style={{color: '#FFFFFF'}}><LoginBlock /></div>
                    <div className="menu__register" onClick={this.registration.bind(this, false)}>{Captions.main_menu.register}</div>
                    <div className="menu__about">{Captions.main_menu.about}</div>
                </div>

            </div>);
    }
}

let DefaultMenuWithRouter = withRouter(DefaultMenu);


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
                <div className="menu__notifications_text">{ (this.state.last && this.state.last.text) ? this.state.last.text : Captions.main_menu.notification_default_text }</div>
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
            <div className="menu__content">
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
        this.state = {open: true, user: UserAction.getStore().user};
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
        UserAction.onChange(SAVE_USER, this.setUser);
        UserAction.onChange(GET_ME, this.setUser);
        UserAction.onChange(LOGIN, this.setUser);
        UserAction.onChange(LOGOUT, this.setUser);
    }

    componentWillUnmount() {
        MenuAction.unbind(TOGGLE, this.setOpen);
        UserAction.unbind(SAVE_USER, this.setUser);
        UserAction.unbind(GET_ME, this.setUser);
        UserAction.unbind(LOGIN, this.setUser);
        UserAction.unbind(LOGOUT, this.setUser);
    }

    render() {

        if (!this.state.open) return null;
        return (
            <div id="main_menu" onClick={this.toggleMenu}>
                { this.state.user ? <UserMenuWithRouter user={this.state.user} /> : <DefaultMenuWithRouter /> }

            </div>);
    }
}