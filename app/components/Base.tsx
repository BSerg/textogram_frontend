import * as React from 'react';
import MenuButton from './shared/MenuButton';
import Modal from './shared/Modal';
import PopupPanel from './shared/PopupPanel';
import Notification from './shared/Notification';
import Menu from './Menu';

import {UserAction, GET_ME, LOGIN, LOGOUT} from '../actions/user/UserAction';
import {UserNotificationAction, CHECK_NOTIFICATIONS} from '../actions/user/UserNotificationAction';

import {Constants} from '../constants';

import '../styles/base.scss';
import {MediaQuerySerice} from "../services/MediaQueryService";

export default class Base extends React.Component<any, any> {
    private intervalId: number;

    constructor(props: any) {
        super(props);
        this.state = {
            userNotificationsInterval: null,
            isDesktop: MediaQuerySerice.getIsDesktop()
        };
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
        this.handleNotifications = this.handleNotifications.bind(this);
    }

    handleNotifications() {
        // if (!UserAction.getStore().user || this.intervalId != null) return;
        if (UserAction.getStore().user || !this.state.userNotificationsInterval) {
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

    // stopNotifications() {
    //
    // }

    handleMediaQuery(isDesktop: boolean) {
        if (isDesktop != this.state.isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    componentDidMount() {
        UserAction.onChange([GET_ME, LOGIN, LOGOUT], this.handleNotifications);
        MediaQuerySerice.listen(this.handleMediaQuery);
    }

    componentWillUnmount() {
        UserAction.unbind([GET_ME, LOGIN, LOGOUT], this.handleNotifications);
        MediaQuerySerice.unbind(this.handleMediaQuery);
    }

    render() {
        return (
            <div className="container">
                <Menu />
                <div className="content">
                    {this.props.children}
                </div>
                <MenuButton/>
                {!this.state.isDesktop ? <PopupPanel/> : null}
                <Notification/>
                <Modal/>
            </div>
        )
    }
}