import * as React from 'react';
import {Link, withRouter} from 'react-router';
import {api} from '../api';

import {MenuAction, TOGGLE} from '../actions/MenuAction';
import {UserAction, GET_ME, LOGIN, LOGOUT, SAVE_USER, UPDATE_USER} from '../actions/user/UserAction';
import {NotificationAction, CHECK} from '../actions/NotificationAction'
import {ModalAction, OPEN_MODAL} from '../actions/shared/ModalAction';
import Registration from './Registration';
import {Captions} from '../constants';
import Login from './shared/Login';
import LoginBlock from './shared/LoginBlock';

import {MediaQuerySerice} from '../services/MediaQueryService';

import '../styles/menu.scss';

const ExitIcon = require('babel!svg-react!../assets/images/exit-icon.svg?name=ExitIcon');
const InfoIcon = require('babel!svg-react!../assets/images/info-icon.svg?name=InfoIcon');
const SettingsIcon = require('babel!svg-react!../assets/images/settings.svg?name=SettingsIcon');
const CloseIcon = require('babel!svg-react!../assets/images/close.svg?name=CloseIcon');

const NotificationIcon = require('babel!svg-react!../assets/images/notification_icon.svg?name=NotificationIcon');


interface DefaultMenuPropsInterface {
    isDesktop: boolean;
    router?: any;
}


interface IDefaultMenuStateInterface {
    phone?: string;
    password?: string;
    patternInputPhone?: any;
    patternPhone?: any;
    loginError?: string;
    isAuthorization?: boolean;

}

class DefaultMenu extends React.Component<DefaultMenuPropsInterface, IDefaultMenuStateInterface> {

    constructor() {
        super();
        let patternInputPhone = new RegExp('^\\' + this.getInitialCode() + '\\d{0,10}$');
        let patternPhone = new RegExp('^\\' + this.getInitialCode() + '\\d{1,10}$');
        this.state = {
            phone: this.getInitialCode(), password: '', patternInputPhone: patternInputPhone,
            patternPhone: patternPhone, loginError: null, isAuthorization: false
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
        if (password != this.state.password) {
            this.setState({password: password, loginError: null});
        }
    }

    toggleIsAuthorization() {
        this.setState({isAuthorization: !this.state.isAuthorization});
    }

    authorize() {
        ModalAction.do(OPEN_MODAL, {content: <Login />});
    }

    handleUrlClick(url: string, e: any) {
        e.stopPropagation();
        this.props.router.push(url);
        MenuAction.do(TOGGLE, false);
    }

    registration(isForgotPassword: boolean = false) {
        ModalAction.do(OPEN_MODAL, {content: <Registration isForgotPassword={isForgotPassword} />});
        MenuAction.do(TOGGLE, false);
    }

    stopClosePropagation(e: any) {
        e.stopPropagation();
    }

    closeMenu() {
        MenuAction.do(TOGGLE, false);
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.isDesktop != this.props.isDesktop) {
            this.forceUpdate();
        }
    }

    render() {
        return (
            <div className="menu__content main__menu_default" onClick={this.stopClosePropagation.bind(this)}>

                <div onClick={this.closeMenu.bind(this)} className={this.props.isDesktop ? "menu__close" : "menu__close_mobile"}><CloseIcon /></div>
                { !this.props.isDesktop ? (<div onClick={this.handleUrlClick.bind(this, '/info/')} className="menu__info"><InfoIcon /></div>) : null}

                <div className="menu__user">
                    {
                            this.props.isDesktop ? (
                                <div className="menu__user_avatar_dummy"  onClick={this.handleUrlClick.bind(this, '/')}>
                                </div>
                            ) : null
                        }


                    <div className="menu__user_username">
                        <span  onClick={this.handleUrlClick.bind(this, '/')}>{Captions.main_menu.title}</span>
                    </div>

                </div>


                {
                    !this.props.isDesktop ? (
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
                    ) : null
                }

                {
                    !this.props.isDesktop ? (<div style={{color: '#FFFFFF', justifyContent: 'center'}}><LoginBlock /></div>) : null
                }

                { this.props.isDesktop ? (<div className="menu__about" onClick={this.handleUrlClick.bind(this, '/info/')}>
                        {Captions.main_menu.help}
                    </div>) : null}
                { this.props.isDesktop ? (<div className="menu__about" onClick={this.registration.bind(this, false)}>{Captions.main_menu.register}</div>) : null}

                {
                    !this.props.isDesktop ? (<div className="menu__register" onClick={this.registration.bind(this, false)}>{Captions.main_menu.register}</div>) : null
                }

                {
                    !this.props.isDesktop ? (<div className="menu__about" onClick={this.handleUrlClick.bind(this, '/info/')}>{Captions.main_menu.about}</div>) : null
                }
                {
                    this.props.isDesktop ?
                        (this.state.isAuthorization ? (
                            <div className="menu__authorization menu__login">

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
                                               placeholder={Captions.main_menu.passwordHint}
                                               value={this.state.password} onChange={this.passwordChange.bind(this)}/>
                                        <div className="hint">
                                            <span className="forgot_password" onClick={this.registration.bind(this, true)}>
                                                {Captions.main_menu.forgotPassword}
                                            </span>
                                        </div>
                                    </div>
                                    <button style={{position: 'absolute', opacity: 0}} type="submit">1</button>
                                </form>

                                <div className="menu__authorization_close" onClick={this.toggleIsAuthorization.bind(this)}>
                                    <CloseIcon />
                                </div>


                            </div>) : (
                            <div className="menu__authorization" onClick={this.authorize.bind(this)}>
                                <div className="menu__authorization_caption">{Captions.main_menu.login}:</div>
                                <LoginBlock />
                            </div>))
                     : null
                }


            </div>);
    }
}

let DefaultMenuWithRouter = withRouter(DefaultMenu);

interface NotificationBlockPropsInterface {
    className?: string;
    router?: any;
    showZero?: boolean;
}

class NotificationBlock extends React.Component<NotificationBlockPropsInterface, any> {

    constructor() {
        super();
        this.state = {count: 0, last: null, showText: false};
        this.checkNotifications = this.checkNotifications.bind(this);
    }

    checkNotifications() {
        this.setState({ count: NotificationAction.getStore().count, last: NotificationAction.getStore().last });
    }

    openNotifications() {
        this.props.router.push('/manage/?show=notifications');
        MenuAction.do(TOGGLE, false);
    }

    componentDidMount() {
        this.checkNotifications();
        NotificationAction.onChange(CHECK, this.checkNotifications);
    }

    componentWillUnmount() {
        NotificationAction.unbind(CHECK, this.checkNotifications);
    }

    render() {
        if ((!this.state.count || ! this.state.last) && !this.props.showZero) return null;

        return (
            <div className={"menu__notifications " + (this.props.className || "") + ((!this.state.count || ! this.state.last) ? " zero" : "")}
                 onClick={this.openNotifications.bind(this)}>
                <div className="menu__notifications_icon">
                    <NotificationIcon />
                    <div className="menu__notifications_count">{ this.state.count < 10 ? this.state.count : '9+'}</div>
                </div>

                { this.state.showText ? (
                    <div className="menu__notifications_text">
                        { (this.state.count && this.state.last && this.state.last.text) ? this.state.last.text : '' }
                        { (!this.state.count && !this.state.last) ? Captions.main_menu.notificationZeroText : null }
                    </div>
                ) : null }


            </div>)
    }
}

let NotificationBlockWithRouter = withRouter(NotificationBlock);

interface IUserMenuProps {
    user: any;
    isDesktop: boolean;
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

    createArticle() {
        api.post('/articles/editor/').then((response: any) => {
            this.props.router.push('/articles/' + response.data.id + '/edit/');
        }).catch((error) => {});
        MenuAction.do(TOGGLE, false);
    }

    logout(e: any) {
        e.stopPropagation();
        UserAction.do(LOGOUT, null);
        MenuAction.do(TOGGLE, null);
    }

    stopClosePropagation(e: any) {
        e.stopPropagation();
    }

    closeMenu() {
        MenuAction.do(TOGGLE, false);
    }

    handleUrlClick(url: string, e: any) {
        e.stopPropagation();
        this.props.router.push(url);
        if (!this.props.isDesktop) {
            MenuAction.do(TOGGLE, false);
        }

    }

    render() {
        return this.props.isDesktop ? (
            <div className="menu__content" onClick={this.stopClosePropagation.bind(this)}>

                <div onClick={this.closeMenu.bind(this)} className="menu__close"><CloseIcon /></div>

                <div className="menu__user menu__links">
                    <div className="menu__link">
                        <Link to={"/profile/" + this.props.user.id}>
                            <img src={ this.props.user.avatar } />
                            {Captions.main_menu.myProfile}
                        </Link>
                    </div>
                </div>

                <div className="menu__links">
                    <div className="menu__link">
                        <Link to="/articles/new/">{ Captions.main_menu.create_article }</Link>
                    </div>
                </div>
                <div className="menu__links">
                    <div className="menu__link">
                        <Link to={"/profile/" + this.props.user.id + "/?show=drafts"}>{ Captions.main_menu.drafts }</Link>
                    </div>
                </div>

                <div className="menu__controls">
                    <NotificationBlockWithRouter showZero={true} />
                    <div><Link to="/manage/"><SettingsIcon /></Link></div>
                    <div><Link to="/info/"><InfoIcon /></Link></div>
                    <div onClick={this.logout.bind(this)}><ExitIcon /></div>
                </div>

            </div>) : (
                <div className="menu__content" onClick={this.stopClosePropagation.bind(this)}>
                    <div className="menu__user">
                        <div className="menu__user_avatar" >
                            <img src={ this.props.user.avatar } onClick={this.handleUrlClick.bind(this, '/profile/' + this.props.user.id)} />
                        </div>
                        <div className="menu__user_username" onClick={this.handleUrlClick.bind(this, '/profile/' + this.props.user.id)}><span>{this.props.user.first_name}</span> <span>{this.props.user.last_name}</span></div>

                        <div className="menu__controls">
                            <NotificationBlockWithRouter showZero={true} />
                            <div onClick={this.handleUrlClick.bind(this, '/manage/')}><SettingsIcon /></div>
                            <div onClick={this.logout.bind(this)}><ExitIcon /></div>
                        </div>
                    </div>

                    <div className="menu__links">
                        <div className="menu__link" onClick={this.handleUrlClick.bind(this, '/articles/new/')}>
                            { Captions.main_menu.create_article }
                        </div>
                        <div className="menu__link" onClick={this.handleUrlClick.bind(this, '/profile/' + this.props.user.id + + "/?show=drafts")}>
                            { Captions.main_menu.drafts }
                        </div>
                    </div>
                    <div onClick={this.closeMenu.bind(this)} className="menu__close_mobile" ><CloseIcon /></div>
                    <div onClick={this.handleUrlClick.bind(this, '/info/')} className="menu__info" ><InfoIcon /></div>

                </div>)

    }

}

let UserMenuWithRouter = withRouter(UserMenu);


interface IMenuStateInterface {
    open?: boolean
    user?: any
    isDesktop?: boolean;
}

export default class Menu extends React.Component<any, IMenuStateInterface> {

    constructor() {
        super();
        this.state = {
            open: false,
            user: UserAction.getStore().user,
            isDesktop: MediaQuerySerice.getIsDesktop()
        };
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

    stopClosePropagation(e: any) {
        e.stopPropagation();
    }

    componentDidMount() {

        MediaQuerySerice.listen((isDesktop: boolean) => {
            if (isDesktop != this.state.isDesktop) {
                this.setState({isDesktop: isDesktop});
                MenuAction.do(TOGGLE, false);
            }
        });

        MenuAction.onChange(TOGGLE, this.setOpen);
        UserAction.onChange([SAVE_USER, UPDATE_USER, GET_ME, LOGIN, LOGOUT], this.setUser);
    }

    componentWillUnmount() {
        MenuAction.unbind(TOGGLE, this.setOpen);
        UserAction.unbind([SAVE_USER, UPDATE_USER, GET_ME, LOGIN, LOGOUT], this.setUser);
    }

    render() {
        return (
            <div id="main_menu" onClick={this.toggleMenu} className={this.state.open ? "" : "hidden"}>
                <div onClick={this.stopClosePropagation.bind(this)} className="main_menu_container">
                { this.state.user ?
                    <UserMenuWithRouter user={this.state.user} isDesktop={this.state.isDesktop} /> :
                        <DefaultMenuWithRouter isDesktop={this.state.isDesktop} /> }
                </div>

            </div>);
    }
}