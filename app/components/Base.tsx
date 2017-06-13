import * as React from 'react';
import MenuButton from './shared/MenuButton';
import Modal from './shared/Modal';
import PopupPanel from './shared/PopupPanel';
import Notification from './shared/Notification';
import Menu from './Menu';

import {UserAction, GET_ME, LOGIN, LOGOUT} from '../actions/user/UserAction';
import {UserNotificationAction, CHECK_NOTIFICATIONS} from '../actions/user/UserNotificationAction';

import {MenuAction, TOGGLE} from '../actions/MenuAction';

import {Constants} from '../constants';

import '../styles/base.scss';
import {MediaQuerySerice} from "../services/MediaQueryService";

export default class Base extends React.Component<any, any> {
    private intervalId: number;

    constructor(props: any) {
        super(props);
        this.state = {
            userNotificationsInterval: null,
            isDesktop: MediaQuerySerice.getIsDesktop(),
            authenticated: !!UserAction.getStore().user,
            menuOpen: false,
        };
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
        this.handleUser = this.handleUser.bind(this);
        this.setMenuOpen = this.setMenuOpen.bind(this);

    }

    handleNotifications() {
        if (process.env.IS_LENTACH) return;

        if (UserAction.getStore().user && !this.state.userNotificationsInterval) {
            UserNotificationAction.do(CHECK_NOTIFICATIONS, null);
            this.state.userNotificationsInterval = window.setInterval(() => {
                UserNotificationAction.do(CHECK_NOTIFICATIONS, null);
            }, Constants.notificationIntervalTime);
        }
        else if (!UserAction.getStore().user && this.state.userNotificationsInterval) {
            window.clearInterval(this.state.userNotificationsInterval);
            this.state.userNotificationsInterval = null;
        }
    }

    checkCreated() {
        if (UserAction.getStore().user && UserAction.getStore().user.created) {
            console.log('welcome');
        }
    }

    handleUser() {
        this.setState({authenticated: !!UserAction.getStore().user});
        this.checkCreated();
        this.handleNotifications();
    }

    setMenuOpen() {
        this.setState({ menuOpen: MenuAction.getStore().open });
    }

    handleMediaQuery(isDesktop: boolean) {
        if (isDesktop != this.state.isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    componentDidMount() {
        UserAction.onChange([GET_ME, LOGIN, LOGOUT], this.handleUser);
        MenuAction.onChange(TOGGLE, this.setMenuOpen);
        MediaQuerySerice.listen(this.handleMediaQuery);
    }

    componentWillUnmount() {
        UserAction.unbind([GET_ME, LOGIN, LOGOUT], this.handleUser);
        MenuAction.unbind(TOGGLE, this.setMenuOpen);
        MediaQuerySerice.unbind(this.handleMediaQuery);
    }

    componentWillMount() {
        console.log(process.env.IS_BROWSER);
        if (process.env.IS_BROWSER) {
            let appServer = document.getElementById('app_server');
            console.log(appServer);
            appServer.parentNode.removeChild(appServer);
        }
    }

    render() {
        return (
            <div className="container">
                <Menu />
                <div className={"content" + (this.state.menuOpen ? " content_menu_open" : "")}>
                    {this.props.children}
                </div>
                {
                    (!this.state.authenticated && process.env.IS_LENTACH) ? null : (<MenuButton/>)
                }
                {!this.state.isDesktop ? <PopupPanel/> : null}
                <Notification/>
                <Modal/>
            </div>
        )
    }
}